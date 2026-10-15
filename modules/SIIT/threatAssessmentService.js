
import { randomUUID } from "node:crypto";

const ALLOWED_LIKELIHOODS = new Set([
  "very_low",
  "low",
  "moderate",
  "high",
  "very_high",
  "unknown",
]);

const ALLOWED_IMPACTS = new Set([
  "negligible",
  "minor",
  "moderate",
  "major",
  "severe",
  "unknown",
]);

const ALLOWED_CONFIDENCE = new Set([
  "low",
  "moderate",
  "high",
  "very_high",
  "unknown",
]);

function requireText(value, field, maxLength = 5000) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  return value.trim().slice(0, maxLength);
}

function optionalText(value, maxLength = 5000) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function requireArray(value, field, maxLength = 100) {
  if (!Array.isArray(value)) {
    throw new TypeError(`${field} must be an array.`);
  }

  return structuredClone(value).slice(0, maxLength);
}

function requireEnum(value, allowed, field) {
  if (!allowed.has(value)) {
    throw new Error(`Invalid ${field}: ${String(value)}`);
  }

  return value;
}

function normalizeRefs(values) {
  if (!Array.isArray(values)) return [];

  return [
    ...new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ].slice(0, 200);
}

function normalizeTimestamp(value, field) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} must be a valid timestamp.`);
  }

  return date.toISOString();
}

/**
 * Build a current assessment.
 *
 * Judgments such as likelihood, impact, confidence, and rationale must come
 * from a named assessment process or authorized analyst input. This service
 * validates and structures those judgments; it does not infer truth.
 */
export function createThreatAssessment(input = {}) {
  const now = new Date().toISOString();

  const assessment = {
    assessment_id: randomUUID(),
    assessment_type: "current_situation",
    situation_id: requireText(input.situation_id, "situation_id", 200),

    version: Number.isInteger(input.version) && input.version > 0
      ? input.version
      : 1,

    summary: requireText(input.summary, "summary", 8000),

    geography: requireArray(input.geography ?? [], "geography"),
    affected_entities: requireArray(
      input.affected_entities ?? [],
      "affected_entities"
    ),

    timeline: requireArray(input.timeline ?? [], "timeline"),
    threats: requireArray(input.threats ?? [], "threats"),
    indicators: requireArray(input.indicators ?? [], "indicators"),

    supporting_evidence_refs: normalizeRefs(
      input.supporting_evidence_refs
    ),
    contradictory_evidence_refs: normalizeRefs(
      input.contradictory_evidence_refs
    ),
    relevant_red_record_refs: normalizeRefs(
      input.relevant_red_record_refs
    ),

    likelihood: requireEnum(
      input.likelihood ?? "unknown",
      ALLOWED_LIKELIHOODS,
      "likelihood"
    ),

    impact: requireEnum(
      input.impact ?? "unknown",
      ALLOWED_IMPACTS,
      "impact"
    ),

    confidence: requireEnum(
      input.confidence ?? "unknown",
      ALLOWED_CONFIDENCE,
      "confidence"
    ),

    rationale: requireText(input.rationale, "rationale", 8000),

    time_horizon: {
      starts_at: input.time_horizon?.starts_at
        ? normalizeTimestamp(
            input.time_horizon.starts_at,
            "time_horizon.starts_at"
          )
        : null,
      ends_at: input.time_horizon?.ends_at
        ? normalizeTimestamp(
            input.time_horizon.ends_at,
            "time_horizon.ends_at"
          )
        : null,
      description: optionalText(
        input.time_horizon?.description,
        1000
      ),
    },

    freshness: {
      status: input.freshness?.status ?? "unknown",
      assessed_at: now,
      source_data_through: input.freshness?.source_data_through
        ? normalizeTimestamp(
            input.freshness.source_data_through,
            "freshness.source_data_through"
          )
        : null,
    },

    unknowns: requireArray(input.unknowns ?? [], "unknowns"),
    assumptions: requireArray(input.assumptions ?? [], "assumptions"),
    outstanding_questions: requireArray(
      input.outstanding_questions ?? [],
      "outstanding_questions"
    ),

    created_at: now,
    created_by: requireText(input.created_by, "created_by", 200),
    is_ai_derived: Boolean(input.is_ai_derived),
  };

  if (
    assessment.time_horizon.starts_at &&
    assessment.time_horizon.ends_at &&
    assessment.time_horizon.ends_at <
      assessment.time_horizon.starts_at
  ) {
    throw new Error("The assessment time horizon ends before it starts.");
  }

  return assessment;
}

/**
 * Compare two assessment versions without replacing either.
 */
export function compareThreatAssessments(previous, next) {
  if (!previous || !next) {
    throw new TypeError("Both assessment versions are required.");
  }

  if (previous.situation_id !== next.situation_id) {
    throw new Error("Cannot compare assessments from different situations.");
  }

  const fields = [
    "summary",
    "likelihood",
    "impact",
    "confidence",
    "rationale",
    "supporting_evidence_refs",
    "contradictory_evidence_refs",
    "threats",
    "indicators",
    "unknowns",
    "assumptions",
  ];

  const changes = [];

  for (const field of fields) {
    if (
      JSON.stringify(previous[field]) !==
      JSON.stringify(next[field])
    ) {
      changes.push({
        field,
        previous: previous[field] ?? null,
        next: next[field] ?? null,
      });
    }
  }

  return {
    situation_id: previous.situation_id,
    previous_assessment_id: previous.assessment_id,
    next_assessment_id: next.assessment_id,
    previous_version: previous.version,
    next_version: next.version,
    changed: changes.length > 0,
    changes,
    compared_at: new Date().toISOString(),
  };
}
