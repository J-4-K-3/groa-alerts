
/**
 * R.E.D. — Researched Emerging Data
 * File: collectionService.js
 *
 * Purpose:
 * Retrieve material from enabled, registered HTTP/HTTPS sources.
 *
 * Boundaries:
 * - Collection is not verification.
 * - A successful HTTP response does not establish truth.
 * - A failed request does not establish that no event occurred.
 * - External content is untrusted input.
 * - This service does not make threat or evacuation decisions.
 *
 * Dependencies:
 * - Node.js with global fetch and AbortSignal.timeout support.
 * - sourceRegistry.js
 *
 * Security:
 * - Restricts destinations to public HTTP/HTTPS endpoints.
 * - Blocks common private, loopback, and link-local IP destinations.
 * - Does not follow redirects, avoiding redirect-based destination bypasses.
 * - Applies response-size and request-time limits.
 *
 * Production note:
 * Add DNS/IP validation at the actual connection boundary before
 * using this against untrusted source URLs in production. A URL-level
 * check alone cannot completely prevent DNS rebinding or SSRF.
 */

import {
  getSource,
  listSources,
  recordCollectionOutcome,
} from "./sourceRegistry.js";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 1_000_000;
const DEFAULT_USER_AGENT = "GROA-RED-Collector/1.0";

const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 30_000;

const MIN_MAX_BYTES = 1_024;
const MAX_MAX_BYTES = 5_000_000;

// Simple in-process throttling.
// For multiple server instances, use shared infrastructure instead.
const lastRequestBySource = new Map();

const DEFAULT_MIN_INTERVAL_MS = 5_000;

// --------------------------------------------------
// ERRORS
// --------------------------------------------------

export class CollectionError extends Error {
  constructor(message, code = "COLLECTION_ERROR") {
    super(message);
    this.name = "CollectionError";
    this.code = code;
  }
}

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

function validateInteger(value, name, min, max) {
  if (
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new TypeError(
      `${name} must be an integer between ${min} and ${max}.`
    );
  }

  return value;
}

function validateHttpUrl(rawUrl) {
  let url;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new CollectionError(
      "Source does not contain a valid URL.",
      "INVALID_URL"
    );
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new CollectionError(
      "Only HTTP and HTTPS sources are supported.",
      "UNSUPPORTED_PROTOCOL"
    );
  }

  if (url.username || url.password) {
    throw new CollectionError(
      "URLs containing embedded credentials are not permitted.",
      "URL_CREDENTIALS_REJECTED"
    );
  }

  const hostname = url.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "");

  const blockedHostnames = new Set([
    "localhost",
    "localhost.localdomain",
    "metadata.google.internal",
  ]);

  if (
    blockedHostnames.has(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new CollectionError(
      "Local and internal hostnames are not permitted.",
      "PRIVATE_HOST_REJECTED"
    );
  }

  // Reject common non-public IPv4 ranges.
  // This is a defensive first layer, not a complete IP security policy.
  const ipv4 = hostname.match(
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  );

  if (ipv4) {
    const octets = ipv4.slice(1).map(Number);

    if (octets.some((octet) => octet > 255)) {
      throw new CollectionError(
        "Invalid IPv4 address.",
        "INVALID_IP"
      );
    }

    const [a, b] = octets;

    const blocked =
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224;

    if (blocked) {
      throw new CollectionError(
        "Non-public IPv4 destinations are not permitted.",
        "PRIVATE_IP_REJECTED"
      );
    }
  }

  // Block IPv6 loopback, unique-local, link-local, and IPv4-mapped forms.
  if (
    hostname === "::" ||
    hostname === "::1" ||
    /^f[cd]/i.test(hostname) ||
    /^fe[89ab]/i.test(hostname) ||
    hostname.startsWith("::ffff:")
  ) {
    throw new CollectionError(
      "Non-public IPv6 destinations are not permitted.",
      "PRIVATE_IP_REJECTED"
    );
  }

  return url;
}

// --------------------------------------------------
// RATE LIMITING
// --------------------------------------------------

function enforceSourceInterval(sourceId, intervalMs) {
  const now = Date.now();
  const previous = lastRequestBySource.get(sourceId);

  if (previous !== undefined) {
    const elapsed = now - previous;

    if (elapsed < intervalMs) {
      throw new CollectionError(
        `Source rate limit active. Retry in ${
          intervalMs - elapsed
        } ms.`,
        "RATE_LIMITED"
      );
    }
  }

  lastRequestBySource.set(sourceId, now);
}

// --------------------------------------------------
// RESPONSE READING
// --------------------------------------------------

async function readResponseLimited(response, maxBytes) {
  const declaredLength = Number(
    response.headers.get("content-length")
  );

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > maxBytes
  ) {
    throw new CollectionError(
      "Response exceeds the configured size limit.",
      "RESPONSE_TOO_LARGE"
    );
  }

  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        await reader.cancel();

        throw new CollectionError(
          "Response exceeds the configured size limit.",
          "RESPONSE_TOO_LARGE"
        );
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8", {
    fatal: false,
  }).decode(combined);
}

// --------------------------------------------------
// COLLECTION
// --------------------------------------------------

/**
 * Collect material from one registered source.
 *
 * @param {string} sourceId
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function collectSource(
  sourceId,
  options = {}
) {
  const timeoutMs = validateInteger(
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    "timeoutMs",
    MIN_TIMEOUT_MS,
    MAX_TIMEOUT_MS
  );

  const maxBytes = validateInteger(
    options.maxBytes ?? DEFAULT_MAX_BYTES,
    "maxBytes",
    MIN_MAX_BYTES,
    MAX_MAX_BYTES
  );

  const minIntervalMs = validateInteger(
    options.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS,
    "minIntervalMs",
    0,
    3_600_000
  );

  const source = getSource(sourceId);

  if (!source) {
    throw new CollectionError(
      `Source "${sourceId}" was not found.`,
      "SOURCE_NOT_FOUND"
    );
  }

  if (source.state !== "enabled") {
    throw new CollectionError(
      `Source "${sourceId}" is disabled.`,
      "SOURCE_DISABLED"
    );
  }

  if (!source.source_uri) {
    throw new CollectionError(
      "Source has no configured URI.",
      "SOURCE_URI_MISSING"
    );
  }

  let url;

  try {
    url = validateHttpUrl(source.source_uri);
    enforceSourceInterval(sourceId, minIntervalMs);
  } catch (error) {
    // Configuration and rate-limit errors occur before network access.
    // They are not evidence that the remote source is unavailable.
    throw error;
  }

  const collectedAt = new Date().toISOString();

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Accept: [
          "text/html",
          "text/plain",
          "application/json",
          "application/xml",
          "application/rss+xml",
          "*/*;q=0.1",
        ].join(", "),
        "User-Agent": DEFAULT_USER_AGENT,
      },
    });

    if (!response.ok) {
      const outcome =
        response.status === 404 || response.status === 410
          ? "unavailable"
          : "failed";

      recordCollectionOutcome(sourceId, {
        outcome,
        error: `HTTP ${response.status}`,
      });

      return {
        success: false,
        source_id: sourceId,
        source_name: source.source_name,
        source_uri: url.toString(),
        collected_at: collectedAt,
        outcome,
        http_status: response.status,
        content_type: response.headers.get("content-type"),
        content: null,
        error: `HTTP ${response.status}`,
      };
    }

    const contentType =
      response.headers.get("content-type");

    const content = await readResponseLimited(
      response,
      maxBytes
    );

    recordCollectionOutcome(sourceId, {
      outcome: "available",
    });

    return {
      success: true,
      source_id: sourceId,
      source_name: source.source_name,
      source_type: source.source_type,
      source_uri: url.toString(),

      // This is the retrieval time, not the publication time.
      collected_at: collectedAt,

      http_status: response.status,
      content_type: contentType,
      content_length_bytes: Buffer.byteLength(
        content,
        "utf8"
      ),
      content,

      // Parsing and claim verification happen downstream.
      parsed: false,
      verified: false,
    };
  } catch (error) {
    const code = error instanceof CollectionError
      ? error.code
      : error.name === "TimeoutError" ||
          error.name === "AbortError"
        ? "REQUEST_TIMEOUT"
        : "NETWORK_OR_RETRIEVAL_ERROR";

    recordCollectionOutcome(sourceId, {
      outcome: "failed",
      error: code,
    });

    return {
      success: false,
      source_id: sourceId,
      source_name: source.source_name,
      source_uri: url.toString(),
      collected_at: collectedAt,
      outcome: "failed",
      content: null,
      error: code,
    };
  }
}

// --------------------------------------------------
// BATCH COLLECTION
// --------------------------------------------------

/**
 * Collect from all currently enabled sources.
 *
 * Sequential collection avoids launching every source
 * simultaneously and makes source-specific throttling effective.
 */
export async function collectEnabledSources(options = {}) {
  const enabledSources = listSources({
    state: "enabled",
  });

  const results = [];

  for (const source of enabledSources) {
    try {
      const result = await collectSource(
        source.source_id,
        options
      );

      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        source_id: source.source_id,
        source_name: source.source_name,
        outcome: "not_collected",
        error: error instanceof CollectionError
          ? error.code
          : "COLLECTION_ERROR",
      });
    }
  }

  return {
    started_at: new Date().toISOString(),
    total_sources: enabledSources.length,
    successful: results.filter(
      (result) => result.success
    ).length,
    unsuccessful: results.filter(
      (result) => !result.success
    ).length,
    results,
  };
}
