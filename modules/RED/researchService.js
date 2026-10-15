
/**
 * R.E.D. — researchService.js
 *
 * Manages research records, claims, summaries, and lifecycle.
 * Persistence will be supplied by the existing G.R.O.A. connector.
 */

import { randomUUID } from "node:crypto";

export const VERIFICATION_STATUSES = Object.freeze([
  "unassessed",
  "unverified",
  "corroborated",
  "disputed",
  "verified",
  "corrected",
  "outdated",
]);

export const RESEARCH_STATUSES = Object.freeze([
  "received",
  "queued",
  "researching",
  "awaiting_evidence",
  "completed",
  "failed",
  "superseded",
]);

const records = new Map();

function requireText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} is required.`);
  }

  return value.trim();
}

function validateStatus(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw new TypeError(`${field} has an invalid value.`);
  }
}

function timestamp(value, field) {
  if (value == null) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`${field} must be a valid timestamp.`);
  }

  return date.toISOString();
}

function snapshot(record) {
  // Prevent callers from mutating stored nested objects.
  return structuredClone(record);
}

function addHistory(record, actorId, action, details = {}) {
  record.change_history.push({
    revision_id: randomUUID(),
    actor_id: actorId ?? null,
    action,
    details: structuredClone(details),
    changed_at: new Date().toISOString(),
  });
}

/**
 * Create a new research record.
 */
export function createResearchRecord(input = {}, actorId = null) {
  const now = new Date().toISOString();

  const record = {
    record_id: randomUUID(),
    event_id: input.event_id ?? null,
    title: requireText(input.title, "title"),
    summary: input.summary == null ? "" : requireText(input.summary, "summary"),
    category: input.category ?? "unclassified",
    locations: Array.isArray(input.locations)
      ? structuredClone(input.locations)
      : [],
    occurred_at: timestamp(input.occurred_at, "occurred_at"),
    first_observed_at: timestamp(
      input.first_observed_at,
      "first_observed_at"
    ),
    created_at: now,
    updated_at: now,
    sources: [],
    claims: [],
    correlations: [],
    verification_status: "unassessed",
    research_status: "received",
    limitations: Array.isArray(input.limitations)
      ? [...input.limitations]
      : [],
    change_history: [],
    record_version: 1,
  };

  addHistory(record, actorId, "record_created");
  records.set(record.record_id, record);

  return snapshot(record);
}

export function getResearchRecord(recordId) {
  const record = records.get(recordId);
  return record ? snapshot(record) : null;
}

export function listResearchRecords({
  research_status,
  verification_status,
  category,
} = {}) {
  return [...records.values()]
    .filter((record) =>
      !research_status || record.research_status === research_status
    )
    .filter((record) =>
      !verification_status ||
      record.verification_status === verification_status
    )
    .filter((record) => !category || record.category === category)
    .map(snapshot);
}

/**
 * Move a record through its research lifecycle.
 */
export function updateResearchStatus(
  recordId,
  status,
  { actorId = null, reason = null } = {}
) {
  validateStatus(status, RESEARCH_STATUSES, "research_status");

  const record = records.get(recordId);
  if (!record) throw new Error("Research record not found.");

  const previous = record.research_status;

  record.research_status = status;
  record.updated_at = new Date().toISOString();
  record.record_version += 1;

  addHistory(record, actorId, "research_status_changed", {
    previous,
    current: status,
    reason,
  });

  return snapshot(record);
}

/**
 * Add a claim without automatically verifying it.
 */
export function addClaim(recordId, input = {}, actorId = null) {
  const record = records.get(recordId);
  if (!record) throw new Error("Research record not found.");

  const claim = {
    claim_id: randomUUID(),
    record_id: recordId,
    claim_text: requireText(input.claim_text, "claim_text"),
    claim_type: input.claim_type ?? "reported_assertion",
    source_references: Array.isArray(input.source_references)
      ? [...new Set(input.source_references)]
      : [],
    supporting_evidence: [],
    contradicting_evidence: [],
    verification_status: "unassessed",
    confidence_rationale: input.confidence_rationale ?? null,
    first_recorded_at: new Date().toISOString(),
    last_reviewed_at: null,
  };

  record.claims.push(claim);
  record.updated_at = new Date().toISOString();
  record.record_version += 1;

  addHistory(record, actorId, "claim_added", {
    claim_id: claim.claim_id,
  });

  return structuredClone(claim);
}

/**
 * Link an already registered source to a research record.
 */
export function attachSource(recordId, sourceId, actorId = null) {
  const record = records.get(recordId);
  if (!record) throw new Error("Research record not found.");

  const id = requireText(sourceId, "sourceId");

  if (!record.sources.includes(id)) {
    record.sources.push(id);
    record.updated_at = new Date().toISOString();
    record.record_version += 1;

    addHistory(record, actorId, "source_attached", {
      source_id: id,
    });
  }

  return snapshot(record);
}

/**
 * Replace the summary while preserving its revision history.
 * Summaries should include uncertainty and evidence limitations.
 */
export function updateResearchSummary(
  recordId,
  summary,
  { actorId = null, reason = null } = {}
) {
  const record = records.get(recordId);
  if (!record) throw new Error("Research record not found.");

  const previous = record.summary;

  record.summary = requireText(summary, "summary");
  record.updated_at = new Date().toISOString();
  record.record_version += 1;

  addHistory(record, actorId, "summary_updated", {
    previous_summary: previous,
    reason,
  });

  return snapshot(record);
}

/**
 * Produce a structured handoff view.
 * This function does not assign threat severity.
 */
export function buildResearchSummary(recordId) {
  const record = records.get(recordId);
  if (!record) throw new Error("Research record not found.");

  return {
    record_id: record.record_id,
    record_version: record.record_version,
    title: record.title,
    summary: record.summary,
    category: record.category,
    locations: structuredClone(record.locations),
    occurred_at: record.occurred_at,
    updated_at: record.updated_at,
    source_references: [...record.sources],
    claims: record.claims.map((claim) => ({
      claim_id: claim.claim_id,
      claim_text: claim.claim_text,
      verification_status: claim.verification_status,
      source_references: [...claim.source_references],
      supporting_evidence: [...claim.supporting_evidence],
      contradicting_evidence: [...claim.contradicting_evidence],
    })),
    correlations: structuredClone(record.correlations),
    verification_status: record.verification_status,
    research_status: record.research_status,
    limitations: [...record.limitations],
    record_version_is_current: true,
  };
}
