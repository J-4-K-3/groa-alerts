
/**
 * R.E.D. — evidenceService.js
 *
 * Responsibilities:
 * - Register evidence and preserve provenance.
 * - Link evidence to individual claims.
 * - Distinguish supporting from contradicting evidence.
 * - Track verification reviews and their rationale.
 * - Preserve evidence and review history.
 *
 * This service does not independently verify claims.
 * Review outcomes must come from an authorized workflow.
 */

import { randomUUID } from "node:crypto";

export const EVIDENCE_RELATIONSHIPS = Object.freeze([
  "supports",
  "contradicts",
  "contextualizes",
]);

export const EVIDENCE_ORIGINS = Object.freeze([
  "original_reporting",
  "independent_corroboration",
  "secondary_reporting",
  "syndicated_reporting",
  "operator_provided",
  "ai_derived",
  "unknown",
]);

export const CLAIM_REVIEW_STATUSES = Object.freeze([
  "unassessed",
  "unverified",
  "corroborated",
  "disputed",
  "verified",
  "corrected",
  "outdated",
]);

const evidenceRecords = new Map();
const claimEvidenceLinks = new Map();
const claimReviewHistory = new Map();

function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} is required.`);
  }

  return value.trim();
}

function optionalText(value, field) {
  if (value == null || value === "") return null;
  return requiredText(value, field);
}

function validTimestamp(value, field) {
  if (value == null) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`${field} must be a valid timestamp.`);
  }

  return date.toISOString();
}

function copy(value) {
  return structuredClone(value);
}

// --------------------------------------------------
// EVIDENCE REGISTRATION
// --------------------------------------------------

/**
 * Register evidence associated with a source or submission.
 *
 * source_id, submission_id, and source_uri are provenance
 * references, not proof that the material is authentic.
 */
export function registerEvidence(input = {}, actorId = null) {
  const evidenceType = requiredText(
    input.evidence_type,
    "evidence_type"
  );

  const origin = input.origin ?? "unknown";

  if (!EVIDENCE_ORIGINS.includes(origin)) {
    throw new TypeError("Invalid evidence origin.");
  }

  const evidence = {
    evidence_id: randomUUID(),

    evidence_type: evidenceType,
    description: requiredText(
      input.description,
      "description"
    ),

    source_id: optionalText(input.source_id, "source_id"),
    submission_id: optionalText(
      input.submission_id,
      "submission_id"
    ),
    source_uri: optionalText(
      input.source_uri,
      "source_uri"
    ),

    // Only record timestamps actually supplied or observed.
    published_at: validTimestamp(
      input.published_at,
      "published_at"
    ),
    collected_at: validTimestamp(
      input.collected_at,
      "collected_at"
    ),

    origin,
    derived_from: Array.isArray(input.derived_from)
      ? [...new Set(input.derived_from)]
      : [],

    // An AI-generated item is derived material, not
    // independent corroboration of its input.
    is_ai_derived: origin === "ai_derived",

    registered_by: actorId ?? null,
    registered_at: new Date().toISOString(),
  };

  evidenceRecords.set(evidence.evidence_id, evidence);

  return copy(evidence);
}

export function getEvidence(evidenceId) {
  const evidence = evidenceRecords.get(evidenceId);
  return evidence ? copy(evidence) : null;
}

export function listEvidence({ source_id, origin } = {}) {
  return [...evidenceRecords.values()]
    .filter((item) => !source_id || item.source_id === source_id)
    .filter((item) => !origin || item.origin === origin)
    .map(copy);
}

// --------------------------------------------------
// CLAIM-EVIDENCE LINKS
// --------------------------------------------------

/**
 * Link registered evidence to a claim.
 *
 * recordId and claimId must be validated against the
 * authoritative research store by the connector before use.
 */
export function linkEvidenceToClaim(
  { recordId, claimId, evidenceId, relationship },
  actorId = null
) {
  const record = requiredText(recordId, "recordId");
  const claim = requiredText(claimId, "claimId");
  const evidence = requiredText(evidenceId, "evidenceId");

  if (!evidenceRecords.has(evidence)) {
    throw new Error("Evidence record not found.");
  }

  if (!EVIDENCE_RELATIONSHIPS.includes(relationship)) {
    throw new TypeError("Invalid evidence relationship.");
  }

  const linkKey = `${record}:${claim}`;

  if (!claimEvidenceLinks.has(linkKey)) {
    claimEvidenceLinks.set(linkKey, []);
  }

  const links = claimEvidenceLinks.get(linkKey);

  const duplicate = links.find(
    (link) =>
      link.evidence_id === evidence &&
      link.relationship === relationship
  );

  if (duplicate) {
    return copy(duplicate);
  }

  const link = {
    link_id: randomUUID(),
    record_id: record,
    claim_id: claim,
    evidence_id: evidence,
    relationship,
    linked_by: actorId ?? null,
    linked_at: new Date().toISOString(),
  };

  links.push(link);

  return copy(link);
}

export function getClaimEvidence(recordId, claimId) {
  const key = `${recordId}:${claimId}`;
  const links = claimEvidenceLinks.get(key) ?? [];

  return links.map((link) => ({
    ...copy(link),
    evidence: getEvidence(link.evidence_id),
  }));
}

// --------------------------------------------------
// VERIFICATION REVIEW HISTORY
// --------------------------------------------------

/**
 * Record an authorized review of a claim's evidence.
 *
 * This records a review decision; it does not independently
 * establish that the decision is correct.
 */
export function recordClaimReview(
  {
    recordId,
    claimId,
    verificationStatus,
    rationale,
    evidenceIds = [],
  },
  actorId
) {
  const record = requiredText(recordId, "recordId");
  const claim = requiredText(claimId, "claimId");
  const actor = requiredText(actorId, "actorId");

  if (!CLAIM_REVIEW_STATUSES.includes(verificationStatus)) {
    throw new TypeError("Invalid verification status.");
  }

  const explanation = requiredText(rationale, "rationale");

  if (!Array.isArray(evidenceIds)) {
    throw new TypeError("evidenceIds must be an array.");
  }

  // Every cited evidence item must exist.
  for (const evidenceId of evidenceIds) {
    if (!evidenceRecords.has(evidenceId)) {
      throw new Error(
        `Evidence "${evidenceId}" was not found.`
      );
    }
  }

  const key = `${record}:${claim}`;
  const history = claimReviewHistory.get(key) ?? [];

  const previous = history.at(-1) ?? null;

  const review = {
    review_id: randomUUID(),
    record_id: record,
    claim_id: claim,
    previous_status: previous?.verification_status ?? null,
    verification_status: verificationStatus,
    rationale: explanation,
    evidence_ids: [...new Set(evidenceIds)],
    reviewed_by: actor,
    reviewed_at: new Date().toISOString(),
  };

  history.push(review);
  claimReviewHistory.set(key, history);

  return copy(review);
}

export function getClaimReviewHistory(recordId, claimId) {
  const key = `${recordId}:${claimId}`;

  return copy(claimReviewHistory.get(key) ?? []);
}

export function getLatestClaimReview(recordId, claimId) {
  const history = getClaimReviewHistory(recordId, claimId);

  return history.at(-1) ?? null;
}
