
/**
 * R.E.D. — submissionService.js
 *
 * Accepts and validates operator-submitted research inputs.
 * Authorization must be enforced by the existing connector/API.
 */

import { randomUUID } from "node:crypto";

const submissions = new Map();

const SUBMISSION_TYPES = Object.freeze([
  "report",
  "source_reference",
  "observation",
  "correction",
  "research_request",
  "additional_evidence",
]);

const MAX_TEXT_LENGTH = 20_000;

function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} is required.`);
  }

  const text = value.trim();

  if (text.length > MAX_TEXT_LENGTH) {
    throw new RangeError(`${field} exceeds the length limit.`);
  }

  return text;
}

function optionalUrl(value) {
  if (value == null || value === "") return null;

  let url;

  try {
    url = new URL(value);
  } catch {
    throw new TypeError("source_uri must be a valid URL.");
  }

  if (!["https:", "http:"].includes(url.protocol)) {
    throw new TypeError("Only HTTP/HTTPS URLs are supported.");
  }

  if (url.username || url.password) {
    throw new TypeError("URLs containing credentials are not allowed.");
  }

  return url.toString();
}

function optionalTimestamp(value, field) {
  if (value == null) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`${field} must be a valid timestamp.`);
  }

  return date.toISOString();
}

/**
 * Submit a research input.
 *
 * actorId must originate from trusted authentication context.
 * Do not accept an untrusted client-supplied actor ID as proof
 * of authorization.
 */
export function submitInformation(input = {}, actorId) {
  const actor = requiredText(actorId, "actorId");
  const type = input.submission_type;

  if (!SUBMISSION_TYPES.includes(type)) {
    throw new TypeError(
      `submission_type must be one of: ${SUBMISSION_TYPES.join(", ")}`
    );
  }

  const content = requiredText(input.content, "content");
  const now = new Date().toISOString();

  const submission = {
    submission_id: randomUUID(),
    submission_type: type,
    content,
    source_uri: optionalUrl(input.source_uri),
    source_name: input.source_name == null
      ? null
      : requiredText(input.source_name, "source_name"),
    related_record_id: input.related_record_id == null
      ? null
      : requiredText(input.related_record_id, "related_record_id"),
    occurred_at: optionalTimestamp(input.occurred_at, "occurred_at"),
    submitted_by: actor,
    submitted_at: now,
    status: "received",

    // A submission is an input, not confirmation.
    verification_status: "unassessed",
  };

  submissions.set(submission.submission_id, submission);

  return { ...submission };
}

export function getSubmission(submissionId) {
  const submission = submissions.get(submissionId);
  return submission ? { ...submission } : null;
}

export function listSubmissions({ status } = {}) {
  return [...submissions.values()]
    .filter((item) => !status || item.status === status)
    .map((item) => ({ ...item }));
}

/**
 * Update workflow state without changing the submitted content.
 */
export function updateSubmissionStatus(submissionId, status) {
  const allowed = [
    "received",
    "queued",
    "accepted",
    "rejected",
    "quarantined",
    "processed",
  ];

  if (!allowed.includes(status)) {
    throw new TypeError("Invalid submission status.");
  }

  const submission = submissions.get(submissionId);

  if (!submission) {
    throw new Error("Submission not found.");
  }

  const updated = {
    ...submission,
    status,
    status_updated_at: new Date().toISOString(),
  };

  submissions.set(submissionId, updated);

  return { ...updated };
}
