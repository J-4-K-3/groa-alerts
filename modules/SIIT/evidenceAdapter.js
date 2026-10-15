
const ALLOWED_VERIFICATION_STATUSES = new Set([
  "unassessed",
  "unverified",
  "corroborated",
  "disputed",
  "verified",
  "corrected",
  "outdated",
]);

const ALLOWED_EVIDENCE_CLASSES = new Set([
  "observation",
  "reported_claim",
  "document",
  "media",
  "official_statement",
  "assessment",
  "hypothesis",
  "unknown",
]);

const MAX_TEXT_LENGTH = 12000;
const MAX_REFS = 100;

function cleanText(value, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function optionalTimestamp(value) {
  if (value == null || value === "") return null;

  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime())
    ? null
    : timestamp.toISOString();
}

function normalizeStatus(value) {
  const status = cleanText(value, 40).toLowerCase();
  return ALLOWED_VERIFICATION_STATUSES.has(status)
    ? status
    : "unassessed";
}

function normalizeClass(value) {
  const evidenceClass = cleanText(value, 40).toLowerCase();
  return ALLOWED_EVIDENCE_CLASSES.has(evidenceClass)
    ? evidenceClass
    : "unknown";
}

function normalizeReferences(values) {
  if (!Array.isArray(values)) return [];

  return [
    ...new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, MAX_REFS)
    ),
  ];
}

/**
 * Adapt one R.E.D. record into S.I.I.T.'s evidence boundary.
 *
 * This function normalizes metadata only. It does not verify claims,
 * determine whether sources are independent, or create threat conclusions.
 */
export function adaptRedRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new TypeError("A valid R.E.D. record is required.");
  }

  const recordId =
    cleanText(record.record_id ?? record.id, 200);

  if (!recordId) {
    throw new Error("R.E.D. record must have a stable record ID.");
  }

  const sourceRefs = normalizeReferences([
    ...(Array.isArray(record.source_refs) ? record.source_refs : []),
    ...(Array.isArray(record.sources)
      ? record.sources.map((source) =>
          typeof source === "string"
            ? source
            : source?.source_id ?? source?.id
        )
      : []),
  ]);

  const evidenceRefs = normalizeReferences([
    ...(Array.isArray(record.evidence_refs) ? record.evidence_refs : []),
    ...(Array.isArray(record.claims)
      ? record.claims.map((claim) => claim?.evidence_id)
      : []),
  ]);

  const verificationStatus = normalizeStatus(
    record.verification_status
  );

  return {
    record_id: recordId,
    record_version: record.version ?? null,
    title: cleanText(record.title ?? record.headline, 500),
    summary: cleanText(record.summary ?? record.description),
    classification: normalizeClass(
      record.evidence_class ?? record.classification
    ),
    verification_status: verificationStatus,

    // Preserve the upstream status. Never promote it here.
    upstream_verification_status: verificationStatus,

    source_refs: sourceRefs,
    evidence_refs: evidenceRefs,
    related_record_refs: normalizeReferences(
      record.related_record_refs
    ),

    geography: Array.isArray(record.geography)
      ? structuredClone(record.geography).slice(0, 100)
      : [],

    entity_refs: normalizeReferences(record.entity_refs),
    observed_at: optionalTimestamp(record.observed_at),
    published_at: optionalTimestamp(record.published_at),
    updated_at: optionalTimestamp(record.updated_at),

    correction_refs: normalizeReferences(record.correction_refs),
    retraction_refs: normalizeReferences(record.retraction_refs),

    // Correlation must be assessed separately from record normalization.
    independence_assessed: false,
    is_ai_derived: Boolean(record.is_ai_derived),
    adapted_at: new Date().toISOString(),
  };
}

/**
 * Adapt a collection of records while retaining record-level provenance.
 */
export function adaptRedRecords(records) {
  if (!Array.isArray(records)) {
    throw new TypeError("R.E.D. records must be supplied as an array.");
  }

  const seen = new Set();

  return records.map((record) => {
    const adapted = adaptRedRecord(record);

    if (seen.has(adapted.record_id)) {
      throw new Error(
        `Duplicate R.E.D. record ID in input: ${adapted.record_id}`
      );
    }

    seen.add(adapted.record_id);
    return adapted;
  });
}

/**
 * Identify records that require human or upstream review.
 * This is a review queue, not a new verification decision.
 */
export function identifyEvidenceReviewFlags(record) {
  const adapted = adaptRedRecord(record);
  const flags = [];

  if (adapted.verification_status === "unassessed") {
    flags.push("verification_unassessed");
  }

  if (adapted.verification_status === "unverified") {
    flags.push("verification_unverified");
  }

  if (adapted.verification_status === "disputed") {
    flags.push("verification_disputed");
  }

  if (adapted.verification_status === "corrected") {
    flags.push("record_corrected");
  }

  if (adapted.verification_status === "outdated") {
    flags.push("record_outdated");
  }

  if (adapted.source_refs.length === 0) {
    flags.push("source_provenance_missing");
  }

  if (adapted.correction_refs.length > 0) {
    flags.push("correction_requires_review");
  }

  if (adapted.retraction_refs.length > 0) {
    flags.push("retraction_requires_review");
  }

  return {
    record_id: adapted.record_id,
    flags,
    review_required: flags.length > 0,
  };
}
