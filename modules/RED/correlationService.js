import { randomUUID } from "node:crypto";

export const CORRELATION_TYPES = Object.freeze([
  "same_event",
  "possible_duplicate",
  "event_update",
  "related_event",
  "common_source_repetition",
  "contradiction",
]);

export const CORRELATION_STATUSES = Object.freeze([
  "proposed",
  "under_review",
  "accepted",
  "rejected",
  "superseded",
]);

const correlations = new Map();

const requireText = (value, field) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string.`);
  }

  return value.trim();
};

const optionalText = (value, field) => {
  if (value == null || value === "") return null;
  return requireText(value, field);
};

const clone = (value) => structuredClone(value);

function validateEnum(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw new TypeError(
      `${field} must be one of: ${allowed.join(", ")}.`
    );
  }

  return value;
}

function makePairKey(recordA, recordB) {
  // Treat A→B and B→A as the same unordered pair.
  return [recordA, recordB].sort().join("::");
}

function ensureDifferentRecords(recordA, recordB) {
  if (recordA === recordB) {
    throw new Error("A record cannot be correlated with itself.");
  }
}

function addHistory(correlation, actorId, action, details = {}) {
  correlation.change_history.push({
    change_id: randomUUID(),
    actor_id: actorId,
    action,
    details: clone(details),
    changed_at: new Date().toISOString(),
  });
}

/**
 * Register a proposed relationship between two existing research records.
 *
 * IMPORTANT:
 * The connector must validate both record IDs against the authoritative
 * research store and authenticate/authorize the actor before calling this.
 * Registering a relationship does not merge records or verify either event.
 */
export function proposeCorrelation(input = {}, actorId) {
  const recordA = requireText(input.record_a_id, "record_a_id");
  const recordB = requireText(input.record_b_id, "record_b_id");

  ensureDifferentRecords(recordA, recordB);

  const correlationType = validateEnum(
    input.correlation_type,
    CORRELATION_TYPES,
    "correlation_type"
  );

  const actor = optionalText(actorId, "actorId");
  const now = new Date().toISOString();
  const pairKey = makePairKey(recordA, recordB);

  // Prevent accidental duplicate proposals of the same type for the same pair.
  const existing = [...correlations.values()].find(
    (item) =>
      item.pair_key === pairKey &&
      item.correlation_type === correlationType &&
      item.status !== "rejected" &&
      item.status !== "superseded"
  );

  if (existing) {
    return clone(existing);
  }

  const correlation = {
    correlation_id: randomUUID(),
    record_a_id: recordA,
    record_b_id: recordB,
    pair_key: pairKey,
    correlation_type: correlationType,
    rationale: requireText(input.rationale, "rationale"),
    evidence_references: Array.isArray(input.evidence_references)
      ? [...new Set(input.evidence_references.map((id) =>
          requireText(id, "evidence_reference")
        ))]
      : [],
    status: "proposed",
    proposed_by: actor,
    proposed_at: now,
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    change_history: [],
    version: 1,
  };

  addHistory(correlation, actor, "correlation_proposed", {
    correlation_type: correlationType,
  });

  correlations.set(correlation.correlation_id, correlation);
  return clone(correlation);
}

export function getCorrelation(correlationId) {
  const correlation = correlations.get(correlationId);
  return correlation ? clone(correlation) : null;
}

export function listCorrelations({
  recordId,
  status,
  correlationType,
} = {}) {
  return [...correlations.values()]
    .filter((item) => {
      if (
        recordId &&
        item.record_a_id !== recordId &&
        item.record_b_id !== recordId
      ) {
        return false;
      }

      if (status && item.status !== status) return false;

      if (
        correlationType &&
        item.correlation_type !== correlationType
      ) {
        return false;
      }

      return true;
    })
    .map(clone);
}

/**
 * Human-authorized review of a proposed relationship.
 * This changes only the relationship status, never event severity.
 */
export function reviewCorrelation(
  correlationId,
  { status, reviewNotes = null } = {},
  actorId
) {
  const correlation = correlations.get(correlationId);

  if (!correlation) {
    throw new Error(`Correlation not found: ${correlationId}`);
  }

  const nextStatus = validateEnum(
    status,
    ["under_review", "accepted", "rejected", "superseded"],
    "status"
  );

  const actor = requireText(actorId, "actorId");

  if (["rejected", "superseded"].includes(correlation.status)) {
    throw new Error(
      `Cannot review a ${correlation.status} correlation.`
    );
  }

  if (
    correlation.status === "accepted" &&
    nextStatus === "under_review"
  ) {
    throw new Error(
      "An accepted correlation cannot return to under_review."
    );
  }

  const previousStatus = correlation.status;

  correlation.status = nextStatus;
  correlation.reviewed_by = actor;
  correlation.reviewed_at = new Date().toISOString();
  correlation.review_notes = optionalText(reviewNotes, "reviewNotes");
  correlation.version += 1;

  addHistory(correlation, actor, "correlation_reviewed", {
    previous_status: previousStatus,
    new_status: nextStatus,
    review_notes: correlation.review_notes,
  });

  correlations.set(correlationId, correlation);
  return clone(correlation);
}

/**
 * Read-only view of accepted relationships for one record.
 * The caller should still retrieve the associated research records separately.
 */
export function getAcceptedCorrelations(recordId) {
  const id = requireText(recordId, "recordId");

  return [...correlations.values()]
    .filter(
      (item) =>
        item.status === "accepted" &&
        (item.record_a_id === id || item.record_b_id === id)
    )
    .map((item) => ({
      ...clone(item),
      related_record_id:
        item.record_a_id === id
          ? item.record_b_id
          : item.record_a_id,
    }));
}

/**
 * Convenience check for possible duplicate proposals.
 * This does not perform semantic matching or decide whether records are duplicates.
 */
export function findCorrelationForPair(recordA, recordB) {
  ensureDifferentRecords(recordA, recordB);
  const pairKey = makePairKey(
    requireText(recordA, "recordA"),
    requireText(recordB, "recordB")
  );

  return [...correlations.values()]
    .filter((item) => item.pair_key === pairKey)
    .map(clone);
}