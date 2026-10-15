import { randomUUID } from "node:crypto";

const MAX_INPUT_CHARS = 30_000;
const MAX_OUTPUT_CHARS = 20_000;

export const TELVIN_TASKS = Object.freeze([
  "extract_claims",
  "summarize_sources",
  "identify_entities",
  "find_inconsistencies",
  "suggest_correlations",
  "suggest_follow_up",
]);

export class TelvinAdapterError extends Error {
  constructor(message, code = "TELVIN_ADAPTER_ERROR") {
    super(message);
    this.name = "TelvinAdapterError";
    this.code = code;
  }
}

const requireText = (value, field, maxLength = MAX_INPUT_CHARS) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  const result = value.trim();

  if (result.length > maxLength) {
    throw new TypeError(`${field} exceeds the allowed length.`);
  }

  return result;
};

const optionalText = (value, field) => {
  if (value == null || value === "") return null;
  return requireText(value, field);
};

function validateTask(task) {
  if (!TELVIN_TASKS.includes(task)) {
    throw new TypeError(
      `Unsupported Telvin task. Allowed tasks: ${TELVIN_TASKS.join(", ")}.`
    );
  }

  return task;
}

function sanitizeSource(source, index) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new TypeError(`sources[${index}] must be an object.`);
  }

  // Pass only explicitly selected fields to the model.
  // Never pass credentials, internal tokens, or full application objects.
  return {
    source_id: optionalText(source.source_id, `sources[${index}].source_id`),
    source_name: optionalText(
      source.source_name,
      `sources[${index}].source_name`
    ),
    source_type: optionalText(
      source.source_type,
      `sources[${index}].source_type`
    ),
    published_at: optionalText(
      source.published_at,
      `sources[${index}].published_at`
    ),
    content: requireText(
      source.content,
      `sources[${index}].content`,
      MAX_INPUT_CHARS
    ),
  };
}

function validateProviderResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new TelvinAdapterError(
      "Telvin provider returned an invalid response.",
      "INVALID_PROVIDER_RESPONSE"
    );
  }

  // A provider must return structured data, not arbitrary executable content.
  const serialized = JSON.stringify(result);

  if (serialized.length > MAX_OUTPUT_CHARS) {
    throw new TelvinAdapterError(
      "Telvin response exceeds the allowed size.",
      "OUTPUT_TOO_LARGE"
    );
  }

  return structuredClone(result);
}

function buildTaskInstructions(task) {
  const instructions = {
    extract_claims: [
      "Extract claims explicitly present in the supplied source material.",
      "For each claim, include exact source IDs from the supplied input.",
      "Do not invent quotations, events, dates or references.",
      "Keep direct statements distinct from secondhand reports and inference.",
    ],
    summarize_sources: [
      "Summarize only the supplied source material.",
      "Preserve uncertainty, disagreements, and important limitations.",
      "Do not imply that repeated reporting is independent corroboration.",
    ],
    identify_entities: [
      "Identify organizations, people, locations, and dates explicitly mentioned.",
      "Distinguish explicitly stated details from ambiguous interpretations.",
      "Use null when a detail cannot be reliably identified.",
    ],
    find_inconsistencies: [
      "Identify material differences or contradictions between supplied sources.",
      "Cite the source IDs that support each observation.",
      "Do not resolve a contradiction without evidence.",
    ],
    suggest_correlations: [
      "Suggest possible relationships between supplied records.",
      "Use only record IDs supplied in the input.",
      "Distinguish possible duplicates, updates, related events, common-source repetition, and contradictions.",
      "Do not merge records or claim causation from similarity alone.",
    ],
    suggest_follow_up: [
      "Suggest specific follow-up research questions or evidence to seek.",
      "Explain which uncertainty each suggestion would help resolve.",
      "Do not claim that a search has been performed unless results are supplied.",
    ],
  };

  return instructions[task];
}

/**
 * Creates an adapter around a caller-supplied AI provider.
 *
 * Expected provider contract:
 *   provider.generate({
 *     task,
 *     instructions,
 *     payload,
 *     signal
 *   })
 *
 * The provider should return structured JavaScript data. The actual provider
 * implementation, credentials, retries, and network policy belong in the
 * existing G.R.O.A. connector.
 */
export function createTelvinAdapter({
  provider,
  timeoutMs = 15_000,
} = {}) {
  if (!provider || typeof provider.generate !== "function") {
    throw new TypeError(
      "A provider with a generate() function is required."
    );
  }

  if (
    !Number.isInteger(timeoutMs) ||
    timeoutMs < 1_000 ||
    timeoutMs > 60_000
  ) {
    throw new TypeError("timeoutMs must be between 1000 and 60000.");
  }

  async function runResearchTask({
    task,
    payload = {},
    signal,
  } = {}) {
    validateTask(task);

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new TypeError("payload must be an object.");
    }

    // Limit what is sent to Telvin; never pass arbitrary app state wholesale.
    const safePayload = {
      record_id: optionalText(payload.record_id, "record_id"),
      question: optionalText(payload.question, "question"),
      records: Array.isArray(payload.records)
        ? payload.records.map((record, index) => {
            if (!record || typeof record !== "object" || Array.isArray(record)) {
              throw new TypeError(`records[${index}] must be an object.`);
            }

            return {
              record_id: requireText(
                record.record_id,
                `records[${index}].record_id`
              ),
              title: optionalText(record.title, `records[${index}].title`),
              summary: optionalText(
                record.summary,
                `records[${index}].summary`
              ),
              claims: Array.isArray(record.claims)
                ? record.claims.map((claim, claimIndex) => ({
                    claim_id: optionalText(
                      claim?.claim_id,
                      `records[${index}].claims[${claimIndex}].claim_id`
                    ),
                    claim_text: requireText(
                      claim?.claim_text,
                      `records[${index}].claims[${claimIndex}].claim_text`
                    ),
                    source_references: Array.isArray(
                      claim?.source_references
                    )
                      ? [...new Set(claim.source_references.map((id) =>
                          requireText(id, "source_reference")
                        ))]
                      : [],
                  }))
                : [],
            };
          })
        : [],
      sources: Array.isArray(payload.sources)
        ? payload.sources.map(sanitizeSource)
        : [],
    };

    const payloadSize = JSON.stringify(safePayload).length;

    if (payloadSize > MAX_INPUT_CHARS) {
      throw new TelvinAdapterError(
        "Research input exceeds the allowed size.",
        "INPUT_TOO_LARGE"
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(new Error("Telvin request timed out.")),
      timeoutMs
    );

    const abortFromCaller = () => controller.abort(signal.reason);

    if (signal?.aborted) {
      controller.abort(signal.reason);
    } else {
      signal?.addEventListener("abort", abortFromCaller, { once: true });
    }

    try {
      const result = await provider.generate({
        task,
        instructions: buildTaskInstructions(task),
        payload: safePayload,
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        throw new TelvinAdapterError(
          "Telvin research request was aborted or timed out.",
          "REQUEST_ABORTED"
        );
      }

      const validatedResult = validateProviderResult(result);

      return {
        result_id: randomUUID(),
        task,
        status: "completed",
        generated_by: "telvin_ai",
        is_ai_derived: true,
        verification_status: "unassessed",
        result: validatedResult,
        limitations: [
          "AI output is a research aid, not independent evidence.",
          "Source references and extracted claims require validation.",
          "AI output must not automatically change verification status.",
          "No threat severity or evacuation decision was made.",
        ],
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof TelvinAdapterError) throw error;

      throw new TelvinAdapterError(
        controller.signal.aborted
          ? "Telvin research request was aborted or timed out."
          : "Telvin research provider failed.",
        controller.signal.aborted ? "REQUEST_ABORTED" : "PROVIDER_FAILED"
      );
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abortFromCaller);
    }
  }

  return Object.freeze({ runResearchTask });
}