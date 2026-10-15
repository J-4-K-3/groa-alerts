import { randomUUID } from "node:crypto";

export const SITUATION_STATUSES = Object.freeze([
  "open",
  "monitoring",
  "under_review",
  "resolved",
  "archived",
]);

export const PRIORITY_LEVELS = Object.freeze([
  "low",
  "normal",
  "high",
  "critical",
]);

const situations = new Map();
const priorityHistory = new Map();

function requireText(value, field, maxLength = 5000) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  const result = value.trim();

  if (result.length > maxLength) {
    throw new TypeError(`${field} exceeds the maximum length.`);
  }

  return result;
}

function optionalText(value, field, maxLength = 5000) {
  if (value == null || value === "") return null;
  return requireText(value, field, maxLength);
}

function validateEnum(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw new TypeError(
      `${field} must be one of: ${allowed.join(", ")}.`
    );
  }

  return value;
}

function validateTimestamp(value, field) {
  if (value == null || value === "") return null;

  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new TypeError(`${field} must be a valid ISO-compatible timestamp.`);
  }

  return new Date(value).toISOString();
}

function clone(value) {
  return structuredClone(value);
}

function addHistory(situation, actorId, action, details = {}) {
  situation.change_history.push({
    change_id: randomUUID(),
    actor_id: actorId,
    action,
    details: clone(details),
    changed_at: new Date().toISOString(),
  });
}

function appendPriorityHistory(situationId, entry) {
  const history = priorityHistory.get(situationId) ?? [];
  history.push(clone(entry));
  priorityHistory.set(situationId, history);
}

/**
 * Create a situation record.
 *
 * This service manages situation identity and priority metadata.
 * It does not determine threat severity or regional urgency.
 *
 * The connector must authenticate and authorize actorId before calling.
 */
export function createSituation(input = {}, actorId) {
  const actor = requireText(actorId, "actorId");
  const now = new Date().toISOString();

  const title = requireText(input.title, "title", 300);

  const situation = {
    situation_id: randomUUID(),

    title,
    description: optionalText(
      input.description,
      "description",
      10_000
    ),

    status: validateEnum(
      input.status ?? "open",
      SITUATION_STATUSES,
      "status"
    ),

    priority: {
      level: validateEnum(
        input.priority?.level ?? "normal",
        PRIORITY_LEVELS,
        "priority.level"
      ),
      rationale: requireText(
        input.priority?.rationale ?? "Initial default designation.",
        "priority.rationale",
        2000
      ),
      designated_at: now,
      designated_by: actor,
      authorization_ref: optionalText(
        input.priority?.authorization_ref,
        "priority.authorization_ref"
      ),
    },

    geography: Array.isArray(input.geography)
      ? clone(input.geography)
      : [],

    affected_entities: Array.isArray(input.affected_entities)
      ? clone(input.affected_entities)
      : [],

    red_record_refs: Array.isArray(input.red_record_refs)
      ? [...new Set(
          input.red_record_refs.map((id) =>
            requireText(id, "red_record_ref")
          )
        )]
      : [],

    first_observed_at: validateTimestamp(
      input.first_observed_at,
      "first_observed_at"
    ),

    last_intelligence_update_at: null,
    last_assessment_at: null,
    last_successful_assessment_at: null,

    freshness_status: "not_assessed",
    processing_status: "not_assessed",

    created_at: now,
    updated_at: now,
    version: 1,

    change_history: [],
  };

  addHistory(situation, actor, "situation_created", {
    initial_priority: situation.priority.level,
  });

  appendPriorityHistory(situation.situation_id, {
    priority: situation.priority.level,
    rationale: situation.priority.rationale,
    designated_at: now,
    designated_by: actor,
    authorization_ref: situation.priority.authorization_ref,
  });

  situations.set(situation.situation_id, situation);

  return clone(situation);
}

export function getSituation(situationId) {
  const situation = situations.get(situationId);
  return situation ? clone(situation) : null;
}

export function listSituations({
  status,
  priority,
  freshnessStatus,
} = {}) {
  return [...situations.values()]
    .filter((situation) => {
      if (status && situation.status !== status) return false;

      if (priority && situation.priority.level !== priority) {
        return false;
      }

      if (
        freshnessStatus &&
        situation.freshness_status !== freshnessStatus
      ) {
        return false;
      }

      return true;
    })
    .map(clone);
}

export function updateSituationStatus(
  situationId,
  nextStatus,
  actorId,
  reason
) {
  const situation = situations.get(situationId);

  if (!situation) {
    throw new Error(`Situation not found: ${situationId}`);
  }

  const actor = requireText(actorId, "actorId");
  const status = validateEnum(
    nextStatus,
    SITUATION_STATUSES,
    "status"
  );
  const rationale = requireText(reason, "reason", 2000);

  if (situation.status === "archived" && status !== "archived") {
    throw new Error(
      "Archived situations cannot be reopened through this operation."
    );
  }

  const previousStatus = situation.status;

  situation.status = status;
  situation.updated_at = new Date().toISOString();
  situation.version += 1;

  addHistory(situation, actor, "situation_status_changed", {
    previous_status: previousStatus,
    new_status: status,
    reason: rationale,
  });

  situations.set(situationId, situation);

  return clone(situation);
}

/**
 * Change a situation's priority through an explicitly authorized workflow.
 *
 * This function records the designation but does not authenticate the actor
 * or determine whether their authorization is valid. The connector must
 * enforce policy and provide the trusted actor ID and authorization reference.
 */
export function designateSituationPriority(
  situationId,
  {
    level,
    rationale,
    authorizationRef,
  } = {},
  actorId
) {
  const situation = situations.get(situationId);

  if (!situation) {
    throw new Error(`Situation not found: ${situationId}`);
  }

  const actor = requireText(actorId, "actorId");
  const nextLevel = validateEnum(
    level,
    PRIORITY_LEVELS,
    "level"
  );
  const reason = requireText(rationale, "rationale", 2000);
  const authorization = requireText(
    authorizationRef,
    "authorizationRef"
  );

  const previousLevel = situation.priority.level;
  const now = new Date().toISOString();

  situation.priority = {
    level: nextLevel,
    rationale: reason,
    designated_at: now,
    designated_by: actor,
    authorization_ref: authorization,
  };

  situation.updated_at = now;
  situation.version += 1;

  const historyEntry = {
    previous_priority: previousLevel,
    priority: nextLevel,
    rationale: reason,
    designated_at: now,
    designated_by: actor,
    authorization_ref: authorization,
  };

  appendPriorityHistory(situationId, historyEntry);

  addHistory(situation, actor, "situation_priority_changed", historyEntry);

  situations.set(situationId, situation);

  return clone(situation);
}

export function getSituationPriorityHistory(situationId) {
  if (!situations.has(situationId)) {
    throw new Error(`Situation not found: ${situationId}`);
  }

  return clone(priorityHistory.get(situationId) ?? []);
}

/**
 * Record assessment processing metadata without deleting the previous
 * successful assessment or pretending a failed assessment is current.
 */
export function recordAssessmentProcessing(
  situationId,
  {
    processingStatus,
    freshnessStatus,
    attemptedAt = new Date().toISOString(),
    succeeded = false,
  } = {},
  actorId
) {
  const situation = situations.get(situationId);

  if (!situation) {
    throw new Error(`Situation not found: ${situationId}`);
  }

  const actor = requireText(actorId, "actorId");

  const allowedProcessingStatuses = [
    "not_assessed",
    "queued",
    "processing",
    "succeeded",
    "failed",
  ];

  const allowedFreshnessStatuses = [
    "not_assessed",
    "fresh",
    "aging",
    "stale",
    "unknown",
  ];

  const nextProcessingStatus = validateEnum(
    processingStatus,
    allowedProcessingStatuses,
    "processingStatus"
  );

  const nextFreshnessStatus = validateEnum(
    freshnessStatus,
    allowedFreshnessStatuses,
    "freshnessStatus"
  );

  const timestamp = validateTimestamp(attemptedAt, "attemptedAt");

  if (succeeded && nextProcessingStatus !== "succeeded") {
    throw new Error(
      "A successful assessment must use processingStatus 'succeeded'."
    );
  }

  situation.processing_status = nextProcessingStatus;
  situation.freshness_status = nextFreshnessStatus;
  situation.last_assessment_at = timestamp;
  situation.updated_at = new Date().toISOString();
  situation.version += 1;

  if (succeeded) {
    situation.last_successful_assessment_at = timestamp;
  }

  addHistory(situation, actor, "assessment_processing_recorded", {
    processing_status: nextProcessingStatus,
    freshness_status: nextFreshnessStatus,
    succeeded,
    attempted_at: timestamp,
  });

  situations.set(situationId, situation);

  return clone(situation);
}