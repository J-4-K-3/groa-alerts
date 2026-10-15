
/**
 * R.E.D. — Researched Emerging Data
 * File: sourceRegistry.js
 *
 * Purpose:
 * Manage approved information sources, source metadata,
 * enablement and collection health.
 *
 * Important:
 * - This module does not fetch external information.
 * - Source availability does not establish source reliability.
 * - Source reliability does not verify individual claims.
 * - Failed collection never means an event did not occur.
 *
 * Storage: In-memory starter implementation.
 * Integration: Persistence will be connected through G.R.O.A.'s
 * existing connector when its interface is available.
 */

import { randomUUID } from "node:crypto";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

export const SOURCE_TYPES = Object.freeze([
  "government",
  "emergency_management",
  "humanitarian",
  "news",
  "public_document",
  "operator_submission",
  "other",
]);

export const SOURCE_STATES = Object.freeze([
  "enabled",
  "disabled",
]);

export const COLLECTION_STATES = Object.freeze([
  "never_checked",
  "available",
  "unavailable",
  "failed",
  "unknown",
]);

// --------------------------------------------------
// PRIVATE REGISTRY
// --------------------------------------------------

const sources = new Map();

// --------------------------------------------------
// VALIDATION HELPERS
// --------------------------------------------------

function requireText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  return value.trim();
}

function optionalText(value, fieldName) {
  if (value == null || value === "") {
    return null;
  }

  return requireText(value, fieldName);
}

function normalizeTimestamp(value, fieldName) {
  if (value == null) {
    return null;
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    throw new TypeError(`${fieldName} must be a valid timestamp.`);
  }

  return timestamp.toISOString();
}

function validateSourceType(type) {
  if (!SOURCE_TYPES.includes(type)) {
    throw new TypeError(
      `Invalid source type "${type}". ` +
      `Expected one of: ${SOURCE_TYPES.join(", ")}.`
    );
  }
}

function validateUri(uri) {
  if (uri == null || uri === "") {
    return null;
  }

  const value = requireText(uri, "source_uri");

  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new TypeError("source_uri must be a valid URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new TypeError(
      "source_uri must use HTTP or HTTPS."
    );
  }

  return parsed.toString();
}

// --------------------------------------------------
// SOURCE REGISTRATION
// --------------------------------------------------

/**
 * Register a new information source.
 *
 * @param {Object} input
 * @returns {Object} Registered source metadata
 */
export function registerSource(input = {}) {
  const sourceName = requireText(
    input.source_name,
    "source_name"
  );

  const sourceType = input.source_type ?? "other";

  validateSourceType(sourceType);

  const sourceId = input.source_id
    ? requireText(input.source_id, "source_id")
    : randomUUID();

  if (sources.has(sourceId)) {
    throw new Error(`Source "${sourceId}" already exists.`);
  }

  const now = new Date().toISOString();

  const source = {
    source_id: sourceId,
    source_name: sourceName,
    source_type: sourceType,
    source_uri: validateUri(input.source_uri),

    language: optionalText(
      input.language,
      "language"
    ),

    source_relationship: optionalText(
      input.source_relationship,
      "source_relationship"
    ),

    source_notes: optionalText(
      input.source_notes,
      "source_notes"
    ),

    state: input.enabled === false
      ? "disabled"
      : "enabled",

    collection_state: "never_checked",

    // These remain null until a real collection attempt occurs.
    last_attempted_at: null,
    last_successful_access_at: null,
    last_error: null,

    // Registry timestamps are not source publication timestamps.
    created_at: now,
    updated_at: now,
  };

  sources.set(sourceId, source);

  return { ...source };
}

// --------------------------------------------------
// SOURCE RETRIEVAL
// --------------------------------------------------

/**
 * Retrieve a registered source by its ID.
 */
export function getSource(sourceId) {
  const source = sources.get(sourceId);

  return source ? { ...source } : null;
}

/**
 * List registered sources.
 *
 * Optional filters:
 * - source_type
 * - state
 * - collection_state
 */
export function listSources(filters = {}) {
  return Array.from(sources.values())
    .filter((source) => {
      if (
        filters.source_type &&
        source.source_type !== filters.source_type
      ) {
        return false;
      }

      if (
        filters.state &&
        source.state !== filters.state
      ) {
        return false;
      }

      if (
        filters.collection_state &&
        source.collection_state !== filters.collection_state
      ) {
        return false;
      }

      return true;
    })
    .map((source) => ({ ...source }));
}

// --------------------------------------------------
// SOURCE LIFECYCLE
// --------------------------------------------------

/**
 * Enable or disable a source.
 */
export function setSourceEnabled(sourceId, enabled) {
  if (typeof enabled !== "boolean") {
    throw new TypeError("enabled must be a boolean.");
  }

  const source = sources.get(sourceId);

  if (!source) {
    throw new Error(`Source "${sourceId}" was not found.`);
  }

  source.state = enabled ? "enabled" : "disabled";
  source.updated_at = new Date().toISOString();

  return { ...source };
}

/**
 * Update permitted source metadata.
 *
 * Identity and collection history cannot be overwritten here.
 */
export function updateSource(sourceId, updates = {}) {
  const source = sources.get(sourceId);

  if (!source) {
    throw new Error(`Source "${sourceId}" was not found.`);
  }

  const updated = { ...source };

  if (updates.source_name !== undefined) {
    updated.source_name = requireText(
      updates.source_name,
      "source_name"
    );
  }

  if (updates.source_type !== undefined) {
    validateSourceType(updates.source_type);
    updated.source_type = updates.source_type;
  }

  if (updates.source_uri !== undefined) {
    updated.source_uri = validateUri(updates.source_uri);
  }

  if (updates.language !== undefined) {
    updated.language = optionalText(
      updates.language,
      "language"
    );
  }

  if (updates.source_relationship !== undefined) {
    updated.source_relationship = optionalText(
      updates.source_relationship,
      "source_relationship"
    );
  }

  if (updates.source_notes !== undefined) {
    updated.source_notes = optionalText(
      updates.source_notes,
      "source_notes"
    );
  }

  updated.updated_at = new Date().toISOString();

  sources.set(sourceId, updated);

  return { ...updated };
}

// --------------------------------------------------
// COLLECTION HEALTH
// --------------------------------------------------

/**
 * Record the outcome of an actual collection attempt.
 *
 * Call this only after a connector or collection service
 * has attempted to access the source.
 *
 * outcome:
 * - available: source was successfully accessed
 * - unavailable: source was reached but could not provide
 *   the expected material
 * - failed: access or retrieval failed
 */
export function recordCollectionOutcome(
  sourceId,
  { outcome, error = null } = {}
) {
  const source = sources.get(sourceId);

  if (!source) {
    throw new Error(`Source "${sourceId}" was not found.`);
  }

  const allowedOutcomes = [
    "available",
    "unavailable",
    "failed",
  ];

  if (!allowedOutcomes.includes(outcome)) {
    throw new TypeError(
      `Invalid outcome. Expected: ${allowedOutcomes.join(", ")}.`
    );
  }

  if (error != null && typeof error !== "string") {
    throw new TypeError("error must be a string or null.");
  }

  const now = new Date().toISOString();

  source.last_attempted_at = now;
  source.collection_state = outcome;
  source.last_error = outcome === "failed"
    ? (error || "Collection failed; details unavailable.")
    : null;

  if (outcome === "available") {
    source.last_successful_access_at = now;
  }

  source.updated_at = now;

  return { ...source };
}

// --------------------------------------------------
// SOURCE REMOVAL
// --------------------------------------------------

/**
 * Disable a source without deleting its history.
 *
 * Hard deletion is deliberately omitted so references
 * from research records remain meaningful.
 */
export function retireSource(sourceId) {
  return setSourceEnabled(sourceId, false);
}
