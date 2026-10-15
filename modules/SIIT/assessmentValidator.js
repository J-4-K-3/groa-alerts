
const ALLOWED_CONFIDENCE = new Set([
  "low",
  "moderate",
  "high",
  "very_high",
  "unknown",
]);

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

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isArray(value) {
  return Array.isArray(value);
}

function isValidDateOrNull(value) {
  if (value == null) return true;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function addError(errors, code, field, message) {
  errors.push({ code, field, message });
}

function validateCommonReferences(
  item,
  knownRedRecordIds,
  errors
) {
  const refs = [
    ...(item.supporting_evidence_refs ?? []),
    ...(item.contradictory_evidence_refs ?? []),
    ...(item.relevant_red_record_refs ?? []),
  ];

  for (const ref of refs) {
    if (typeof ref !== "string" || !ref.trim()) {
      addError(
        errors,
        "invalid_reference",
        "evidence_refs",
        "Evidence references must be non-empty strings."
      );
      continue;
    }

    // Only validate R.E.D. references against this set.
    // Evidence IDs require their own repository lookup.
    if (
      (item.relevant_red_record_refs ?? []).includes(ref) &&
      knownRedRecordIds &&
      !knownRedRecordIds.has(ref)
    ) {
      addError(
        errors,
        "unknown_red_record",
        "relevant_red_record_refs",
        `Unknown R.E.D. record reference: ${ref}`
      );
    }
  }
}

export function validateThreatAssessment(
  assessment,
  options = {}
) {
  const errors = [];
  const warnings = [];
  const knownRedRecordIds = options.knownRedRecordIds
    ? new Set(options.knownRedRecordIds)
    : null;

  if (!assessment || typeof assessment !== "object") {
    return {
      valid: false,
      errors: [{
        code: "invalid_input",
        field: "assessment",
        message: "Assessment must be an object.",
      }],
      warnings,
    };
  }

  if (assessment.assessment_type !== "current_situation") {
    addError(
      errors,
      "invalid_assessment_type",
      "assessment_type",
      "Expected a current_situation assessment."
    );
  }

  if (!isNonEmptyString(assessment.assessment_id)) {
    addError(errors, "required", "assessment_id", "Assessment ID is required.");
  }

  if (!isNonEmptyString(assessment.situation_id)) {
    addError(errors, "required", "situation_id", "Situation ID is required.");
  }

  if (!isNonEmptyString(assessment.summary)) {
    addError(errors, "required", "summary", "Summary is required.");
  }

  if (!isNonEmptyString(assessment.rationale)) {
    addError(errors, "required", "rationale", "Rationale is required.");
  }

  if (!isNonEmptyString(assessment.created_by)) {
    addError(errors, "required", "created_by", "Creator is required.");
  }

  if (
    !Number.isInteger(assessment.version) ||
    assessment.version < 1
  ) {
    addError(
      errors,
      "invalid_version",
      "version",
      "Version must be a positive integer."
    );
  }

  if (!ALLOWED_LIKELIHOODS.has(assessment.likelihood)) {
    addError(
      errors,
      "invalid_likelihood",
      "likelihood",
      "Likelihood is not an allowed value."
    );
  }

  if (!ALLOWED_IMPACTS.has(assessment.impact)) {
    addError(
      errors,
      "invalid_impact",
      "impact",
      "Impact is not an allowed value."
    );
  }

  if (!ALLOWED_CONFIDENCE.has(assessment.confidence)) {
    addError(
      errors,
      "invalid_confidence",
      "confidence",
      "Confidence is not an allowed value."
    );
  }

  for (const field of [
    "geography",
    "affected_entities",
    "timeline",
    "threats",
    "indicators",
    "supporting_evidence_refs",
    "contradictory_evidence_refs",
    "relevant_red_record_refs",
    "unknowns",
    "assumptions",
    "outstanding_questions",
  ]) {
    if (!isArray(assessment[field])) {
      addError(
        errors,
        "invalid_array",
        field,
        `${field} must be an array.`
      );
    }
  }

  if (assessment.time_horizon) {
    const { starts_at, ends_at } = assessment.time_horizon;

    if (!isValidDateOrNull(starts_at)) {
      addError(
        errors,
        "invalid_timestamp",
        "time_horizon.starts_at",
        "Start timestamp is invalid."
      );
    }

    if (!isValidDateOrNull(ends_at)) {
      addError(
        errors,
        "invalid_timestamp",
        "time_horizon.ends_at",
        "End timestamp is invalid."
      );
    }

    if (
      starts_at &&
      ends_at &&
      isValidDateOrNull(starts_at) &&
      isValidDateOrNull(ends_at) &&
      new Date(ends_at) < new Date(starts_at)
    ) {
      addError(
        errors,
        "invalid_time_horizon",
        "time_horizon",
        "End timestamp must not precede start timestamp."
      );
    }
  }

  validateCommonReferences(
    assessment,
    knownRedRecordIds,
    errors
  );

  if (
    assessment.confidence === "unknown" ||
    assessment.likelihood === "unknown" ||
    assessment.impact === "unknown"
  ) {
    warnings.push({
      code: "judgment_unknown",
      message:
        "One or more assessment judgments are explicitly unknown.",
    });
  }

  if (
    assessment.is_ai_derived &&
    !isNonEmptyString(assessment.rationale)
  ) {
    warnings.push({
      code: "ai_rationale_review",
      message: "AI-derived content requires rationale and review.",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validated_at: new Date().toISOString(),
  };
}

export function validateScenario(scenario, options = {}) {
  const errors = [];
  const warnings = [];

  const knownRedRecordIds = options.knownRedRecordIds
    ? new Set(options.knownRedRecordIds)
    : null;

  if (!scenario || typeof scenario !== "object") {
    return {
      valid: false,
      errors: [{
        code: "invalid_input",
        field: "scenario",
        message: "Scenario must be an object.",
      }],
      warnings,
    };
  }

  if (scenario.classification !== "forecast_scenario") {
    addError(
      errors,
      "invalid_classification",
      "classification",
      "Scenario must be explicitly classified as a forecast."
    );
  }

  for (const field of [
    "scenario_id",
    "situation_id",
    "title",
    "description",
    "confidence_rationale",
    "uncertainty_notes",
    "created_by",
  ]) {
    if (!isNonEmptyString(scenario[field])) {
      addError(
        errors,
        "required",
        field,
        `${field} is required.`
      );
    }
  }

  if (!ALLOWED_CONFIDENCE.has(scenario.confidence)) {
    addError(
      errors,
      "invalid_confidence",
      "confidence",
      "Confidence is not an allowed value."
    );
  }

  for (const field of [
    "supporting_evidence_refs",
    "contradictory_evidence_refs",
    "assumptions",
    "alternative_explanations",
    "potential_consequences",
    "affected_locations",
    "affected_entities",
    "indicators_to_watch",
    "reassessment_conditions",
  ]) {
    if (!isArray(scenario[field])) {
      addError(
        errors,
        "invalid_array",
        field,
        `${field} must be an array.`
      );
    }
  }

  validateCommonReferences(
    scenario,
    knownRedRecordIds,
    errors
  );

  if (
    scenario.probability_estimate != null &&
    (
      typeof scenario.probability_estimate !== "number" ||
      scenario.probability_estimate < 0 ||
      scenario.probability_estimate > 1
    )
  ) {
    addError(
      errors,
      "invalid_probability",
      "probability_estimate",
      "Probability estimate must be between 0 and 1."
    );
  }

  if (scenario.probability_estimate == null) {
    warnings.push({
      code: "probability_not_assessed",
      message:
        "No numerical probability has been assessed for this scenario.",
    });
  }

  if (
    scenario.time_horizon &&
    !isValidDateOrNull(scenario.time_horizon.starts_at)
  ) {
    addError(
      errors,
      "invalid_timestamp",
      "time_horizon.starts_at",
      "Scenario start timestamp is invalid."
    );
  }

  if (
    scenario.time_horizon &&
    !isValidDateOrNull(scenario.time_horizon.ends_at)
  ) {
    addError(
      errors,
      "invalid_timestamp",
      "time_horizon.ends_at",
      "Scenario end timestamp is invalid."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validated_at: new Date().toISOString(),
  };
}
