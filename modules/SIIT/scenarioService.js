
import { randomUUID } from "node:crypto";

const ALLOWED_CONFIDENCE = new Set([
  "low",
  "moderate",
  "high",
  "very_high",
  "unknown",
]);

const ALLOWED_SCENARIO_TYPES = new Set([
  "baseline",
  "escalation",
  "de_escalation",
  "alternative",
  "contingency",
  "unknown",
]);

function requireText(value, field, maxLength = 5000) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  return value.trim().slice(0, maxLength);
}

function optionalText(value, maxLength = 2000) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
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

function normalizeArray(value, field, maxLength = 100) {
  if (value == null) return [];

  if (!Array.isArray(value)) {
    throw new TypeError(`${field} must be an array.`);
  }

  return structuredClone(value).slice(0, maxLength);
}

function normalizeTimestamp(value, field) {
  if (value == null || value === "") return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} must be a valid timestamp.`);
  }

  return date.toISOString();
}

/**
 * Create a scenario draft.
 *
 * This does not assert that the scenario will occur, calculate a real-world
 * probability, or authorize any operational response.
 */
export function createScenario(input = {}) {
  const now = new Date().toISOString();

  const scenarioType = input.scenario_type ?? "unknown";

  if (!ALLOWED_SCENARIO_TYPES.has(scenarioType)) {
    throw new Error(`Invalid scenario_type: ${scenarioType}`);
  }

  const confidence = input.confidence ?? "unknown";

  if (!ALLOWED_CONFIDENCE.has(confidence)) {
    throw new Error(`Invalid confidence: ${confidence}`);
  }

  const startsAt = normalizeTimestamp(
    input.time_horizon?.starts_at,
    "time_horizon.starts_at"
  );

  const endsAt = normalizeTimestamp(
    input.time_horizon?.ends_at,
    "time_horizon.ends_at"
  );

  if (startsAt && endsAt && endsAt < startsAt) {
    throw new Error("Scenario time horizon ends before it starts.");
  }

  return {
    scenario_id: randomUUID(),
    scenario_type: scenarioType,
    classification: "forecast_scenario",
    situation_id: requireText(
      input.situation_id,
      "situation_id",
      200
    ),

    title: requireText(input.title, "title", 500),
    description: requireText(input.description, "description", 8000),

    status: "draft",
    version:
      Number.isInteger(input.version) && input.version > 0
        ? input.version
        : 1,

    supporting_evidence_refs: normalizeRefs(
      input.supporting_evidence_refs
    ),
    contradictory_evidence_refs: normalizeRefs(
      input.contradictory_evidence_refs
    ),

    assumptions: normalizeArray(input.assumptions, "assumptions"),
    alternative_explanations: normalizeArray(
      input.alternative_explanations,
      "alternative_explanations"
    ),

    potential_consequences: normalizeArray(
      input.potential_consequences,
      "potential_consequences"
    ),

    affected_locations: normalizeArray(
      input.affected_locations,
      "affected_locations"
    ),

    affected_entities: normalizeArray(
      input.affected_entities,
      "affected_entities"
    ),

    indicators_to_watch: normalizeArray(
      input.indicators_to_watch,
      "indicators_to_watch"
    ),

    reassessment_conditions: normalizeArray(
      input.reassessment_conditions,
      "reassessment_conditions"
    ),

    confidence,
    confidence_rationale: requireText(
      input.confidence_rationale,
      "confidence_rationale",
      5000
    ),

    probability_estimate: null,
    probability_estimate_status: "not_assessed",

    time_horizon: {
      starts_at: startsAt,
      ends_at: endsAt,
      description: optionalText(
        input.time_horizon?.description,
        1000
      ),
    },

    uncertainty_notes: requireText(
      input.uncertainty_notes,
      "uncertainty_notes",
      5000
    ),

    created_at: now,
    created_by: requireText(input.created_by, "created_by", 200),
    is_ai_derived: Boolean(input.is_ai_derived),
    reviewed_by: null,
    reviewed_at: null,
  };
}

/**
 * Compare scenario versions without implying that either is correct.
 */
export function compareScenarios(previous, next) {
  if (!previous || !next) {
    throw new TypeError("Both scenario versions are required.");
  }

  if (previous.situation_id !== next.situation_id) {
    throw new Error("Cannot compare scenarios from different situations.");
  }

  const fields = [
    "title",
    "description",
    "scenario_type",
    "supporting_evidence_refs",
    "contradictory_evidence_refs",
    "assumptions",
    "alternative_explanations",
    "potential_consequences",
    "affected_locations",
    "affected_entities",
    "indicators_to_watch",
    "reassessment_conditions",
    "confidence",
    "confidence_rationale",
    "time_horizon",
    "uncertainty_notes",
  ];

  const changes = fields
    .filter(
      (field) =>
        JSON.stringify(previous[field]) !==
        JSON.stringify(next[field])
    )
    .map((field) => ({
      field,
      previous: previous[field] ?? null,
      next: next[field] ?? null,
    }));

  return {
    situation_id: previous.situation_id,
    previous_scenario_id: previous.scenario_id,
    next_scenario_id: next.scenario_id,
    previous_version: previous.version,
    next_version: next.version,
    changed: changes.length > 0,
    changes,
    compared_at: new Date().toISOString(),
  };
}

/**
 * Return conditions that could trigger reassessment.
 * This only identifies matching conditions; it does not execute actions.
 */
export function evaluateReassessmentConditions(scenario, observedIndicators) {
  if (!scenario || !Array.isArray(observedIndicators)) {
    throw new TypeError(
      "A scenario and an observed-indicators array are required."
    );
  }

  const observedIds = new Set(
    observedIndicators
      .filter((item) => item && typeof item === "object")
      .map((item) => item.indicator_id)
      .filter((id) => typeof id === "string")
  );

  const matchedIndicators = (scenario.indicators_to_watch ?? [])
    .filter(
      (indicator) =>
        indicator &&
        typeof indicator.indicator_id === "string" &&
        observedIds.has(indicator.indicator_id)
    )
    .map((indicator) => indicator.indicator_id);

  return {
    scenario_id: scenario.scenario_id,
    situation_id: scenario.situation_id,
    matched_indicators: [...new Set(matchedIndicators)],
    reassessment_recommended: matchedIndicators.length > 0,
    evaluated_at: new Date().toISOString(),
  };
}
