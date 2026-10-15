# S.I.I.T. — Situational Intelligence for Incoming Threats

> **System:** G.R.O.A.
> **Module:** S.I.I.T.
> **Full Name:** Situational Intelligence for Incoming Threats
> **Status:** Architecture specification
> **Version:** 1.0
> **Primary dependency:** R.E.D. — Researched Emerging Data
> **Downstream consumers:** V.I.R.U.S. and authorized T.W.O W.E.E.K.S. workflows
> **Implementation note:** File paths and component names in this document describe proposed logical responsibilities. Confirm the repository's existing structure before creating files or duplicating existing services.

---

## 1. Purpose

S.I.I.T. is G.R.O.A.'s situation-interpretation and threat-assessment module.

It receives researched intelligence from R.E.D. and develops a structured understanding of:

* What the available evidence indicates is happening.
* Which threats may be emerging.
* Who or what could be affected.
* How likely and consequential identified threats may be.
* How a situation could plausibly develop.
* Which indicators or new evidence should trigger reassessment.

S.I.I.T. maintains two separate analytical outputs:

1. **Current situation assessment:** What the available evidence supports at the time of assessment.
2. **Forward-looking scenarios:** What could plausibly happen next, based on evidence and explicit assumptions.

S.I.I.T. does not independently issue evacuation orders or present forecasts as confirmed events.

## 2. Core principles

1. **Evidence first:** Material conclusions must link to supporting intelligence wherever possible.
2. **Clear epistemic separation:** Observations, reported claims, assessments, hypotheses, and forecasts must remain distinguishable.
3. **Traceability:** Assessments must retain their evidence references, reasoning, assumptions, uncertainty, and version history.
4. **Priority-driven reassessment:** Continuously monitor designated high-priority situations; assess other situations on demand.
5. **AI with boundaries:** Telvin can assist analysis but cannot manufacture evidence, independently corroborate claims, or bypass authorization.
6. **Preserved history:** Every material assessment change must be traceable.
7. **Explicit uncertainty:** Missing, conflicting, outdated, or unreliable evidence must remain visible.
8. **Fail safely:** Failed processing must never be represented as a successful, up-to-date assessment.

## 3. Position in the G.R.O.A. architecture

```text
R.E.D.
  Researches, correlates, and documents intelligence
       |
       v
S.I.I.T.
  Interprets situations, assesses threats, and evaluates scenarios
       |
       v
V.I.R.U.S.
  Evaluates regional urgency using relevant intelligence
       |
       v
T.W.O W.E.E.K.S.
  Supports authorized threat-warning and evacuation workflows
```

This is the conceptual flow, not a verified description of the current implementation.

### Module responsibilities

| Module           | Responsibility                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| R.E.D.           | Collect, research, correlate, and maintain sourced intelligence.                                   |
| S.I.I.T.         | Interpret evidence, assess threats, maintain situation assessments, and evaluate possible futures. |
| V.I.R.U.S.       | Evaluate regional urgency using relevant intelligence and assessments.                             |
| T.W.O W.E.E.K.S. | Handle designated warning and evacuation operations according to its authorization rules.          |
| Telvin           | Provide AI-assisted analytical capabilities to authorized workflows.                               |

S.I.I.T. should not duplicate R.E.D.'s research responsibilities or take over V.I.R.U.S.'s regional-urgency responsibility.

## 4. Inputs

S.I.I.T. may consume the following information from R.E.D. and authorized workflows:

* Research records and linked source records.
* Claims, evidence items, timestamps, and source metadata.
* Verification, corroboration, dispute, correction, and retraction updates.
* Event descriptions, dates, locations, and affected entities.
* Existing situation records and previous assessment versions.
* Priority designations and their authorization records.
* Operator requests for new assessments or reassessment.

### Input requirements

* Preserve source identifiers and provenance.
* Preserve R.E.D.'s verification status.
* Validate incoming payloads and timestamps.
* Detect duplicate or out-of-order updates.
* Reject or quarantine malformed or unauthorized data.
* Never silently promote an unverified claim to verified.

S.I.I.T. can assess the significance of a claim without changing the claim's underlying verification status.

## 5. Current situation assessment

The current assessment describes the best-supported understanding of a situation at a specific time.

Where applicable, it should contain:

* Situation summary.
* Geographic scope and affected entities.
* Timeline of relevant events.
* Identified threats and supporting indicators.
* Supporting and contradictory evidence.
* Likelihood and potential impact.
* Assessment rationale and confidence.
* Time horizon and evidence freshness.
* Unknowns, assumptions, and unresolved questions.
* Assessment timestamp and version.

Each material conclusion should reference the evidence or reasoning supporting it.

The system must not label an event as confirmed unless the underlying evidence and applicable verification policy justify that designation.

## 6. Forward-looking scenarios

S.I.I.T. also evaluates plausible developments based on the current situation.

Possible scenarios include:

* The situation continues without major change.
* The situation escalates.
* The situation de-escalates.
* A different explanation becomes more plausible.
* A new development changes the threat profile.

Each scenario should include:

* Scenario identifier and description.
* Explicit classification as a forecast.
* Supporting evidence and assumptions.
* Potential consequences.
* Affected locations, people, or infrastructure.
* Time horizon.
* Confidence and uncertainty.
* Indicators that would strengthen or weaken the scenario.
* Conditions that should trigger reassessment.

Scenarios must not be presented as inevitable outcomes. Avoid false precision when the evidence does not support a numerical probability.

### Evidence versus forecast

For example:

* **Reported information:** A source reports that a road is closed.
* **Assessment:** The closure may affect access to a nearby area.
* **Forecast:** If the closure continues and no alternative route is available, access could become more difficult during a specified future period.

These statements have different evidential status. The data model and reports must preserve that distinction.

## 7. Reassessment policy

S.I.I.T. uses a priority-driven reassessment model.

### 7.1 High-priority situations

Designated high-priority situations are continuously monitored through an event-driven monitoring and reassessment workflow.

Potential triggers include:

* Material R.E.D. updates.
* Newly corroborated or contradictory evidence.
* Source corrections, retractions, or significant reliability changes.
* New events or indicators relevant to an existing threat.
* A scenario indicator being observed or failing to appear within its expected window.
* A configured scheduled review or freshness threshold.
* An authorized operator request.

The workflow should deduplicate repeated triggers, avoid unnecessary duplicate assessments, and record the trigger responsible for each reassessment.

**Continuous monitoring does not require Telvin to run nonstop.** It means relevant changes are monitored and processed according to configured service guarantees.

### 7.2 Other situations

Situations that are not designated high priority are assessed on demand.

Examples include:

* An authorized operator requests an assessment.
* A workflow explicitly requests analysis.
* A situation is promoted to high priority.
* A relevant operational review requires a new assessment.

Avoid repeatedly running expensive analysis on low-priority situations without a defined reason.

### 7.3 Priority governance

Priority must be explicit and auditable.

Record:

* Priority level.
* Rationale for the designation.
* Effective timestamp.
* Authorizing actor or rule.
* Subsequent changes and reasons.

S.I.I.T. may recommend reviewing a priority when evidence changes, but changes must follow G.R.O.A.'s authorization policy. An unreviewed AI output must not silently promote or downgrade a situation.

### 7.4 Staleness and failures

Each assessment should indicate when it was last evaluated and whether its evidence may be stale.

If reassessment fails:

* Retain the last successful assessment.
* Mark its freshness or processing status accurately.
* Record the failure and affected workflow.
* Retry according to defined policies where appropriate.
* Never claim the latest situation has been assessed successfully when it has not.

## 8. Analysis pipeline

1. **Receive intelligence:** Consume relevant R.E.D. records, source references, updates, and corrections.
2. **Validate inputs:** Check schema, identifiers, timestamps, provenance, and access permissions.
3. **Build the situation picture:** Group related events and establish timelines, locations, and affected entities.
4. **Evaluate evidence:** Review source quality, corroboration, contradictions, freshness, and gaps.
5. **Identify threats:** Develop evidence-supported threat hypotheses and distinguish them from speculation.
6. **Assess current conditions:** Evaluate likelihood, impact, exposure, time horizon, and confidence.
7. **Develop scenarios:** Generate plausible futures with explicit assumptions, indicators, and uncertainty.
8. **Validate analytical output:** Check evidence references, category separation, unsupported claims, and policy compliance.
9. **Publish a versioned assessment:** Make approved outputs available to authorized downstream consumers.
10. **Reassess or await a request:** Apply the appropriate priority-specific policy and retain the assessment history.

## 9. Telvin integration

Telvin provides AI-assisted analysis within defined boundaries.

### Permitted assistance

Telvin may help:

* Summarize evidence while retaining source references.
* Compare reports and identify contradictions.
* Suggest relationships between events.
* Identify missing information and research questions.
* Propose threat hypotheses and alternative explanations.
* Draft possible scenarios and identify observable indicators.
* Compare assessment versions and summarize material changes.

### Prohibited behavior

Telvin must not:

* Invent events, sources, quotations, or evidence.
* Treat repetition of the same claim as independent corroboration.
* Silently upgrade verification status.
* Present a forecast as an observed fact.
* Hide contradictory information or uncertainty.
* Independently authorize evacuation orders.
* Bypass required human review or operational authorization.

AI-generated claims must be checked against source records before publication.

Where feasible, record:

* AI service or model identifier.
* Run timestamp.
* Input record identifiers or version references.
* Output type.
* Validation and review status.
* Accepted result and its assessment version.

Do not log credentials or unnecessary sensitive information.

## 10. Proposed logical files

The following is a suggested organization, not a claim that these files already exist. Adapt it to the repository's established conventions.

| Proposed file or component         | Responsibility                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `/index` or `/siitService` | Entry point and orchestration of S.I.I.T. workflows.                               |
| `/situationService`            | Create, retrieve, update, and group situation records.                             |
| `/evidenceAdapter`             | Read R.E.D. records while preserving provenance and verification metadata.         |
| `/threatAssessmentService`     | Evaluate threat hypotheses, likelihood, impact, exposure, and rationale.           |
| `/scenarioService`             | Manage forecasts, assumptions, indicators, and time horizons.                      |
| `/reassessmentService`         | Handle priority-based triggers, on-demand requests, deduplication, and scheduling. |
| `/telvinAdapter`               | Request AI-assisted analysis and validate structured responses.                    |
| `/assessmentValidator`         | Enforce schemas, evidence references, uncertainty, and category separation.        |
| `/assessmentRepository`        | Persist versioned assessments and retrieve historical versions.                    |
| `/publicationService`          | Publish approved assessments to authorized consumers.                              |
| `/auditService`                | Record triggers, review actions, material changes, and version history.            |
| `/schemas`                     | Validate situation, assessment, threat, scenario, and event payloads.              |
| `/policies`                    | Hold configurable priority, freshness, reassessment, and review rules.             |
| `/tests`                       | Unit, integration, contract, and failure-path tests.                               |

Possible test files include:

* `/tests/assessment.test`
* `/tests/reassessment.test`
* `/tests/scenarios.test`
* `/tests/integration.test`

Use the actual test framework and file extensions present in the repository.

Do not create a second service if an existing G.R.O.A. component already performs that responsibility.

## 11. Conceptual assessment data structure

This example illustrates the intended information model. It is not a final database migration or an existing API contract.

```js
{
  situationId: "stable-situation-id",
  assessmentId: "stable-assessment-id",
  version: 1,
  assessedAt: "ISO-8601 timestamp",

  status: "draft",
  // Other permitted statuses should be defined in the schema.

  priority: {
    level: "configured-priority",
    rationale: "Why this designation applies",
    designatedAt: "ISO-8601 timestamp",
    designatedBy: "authorized actor or rule"
  },

  scope: {
    geography: [],
    affectedEntities: [],
    timeWindow: {}
  },

  evidenceRefs: [
    {
      redRecordId: "source-record-id",
      claimId: "claim-id",
      verificationStatus: "preserved-from-red",
      relevance: "Why this evidence matters"
    }
  ],

  currentAssessment: {
    summary: "Evidence-based current picture",
    threats: [],
    likelihood: {},
    impact: {},
    confidence: {},
    rationale: [],
    unknowns: [],
    contradictions: []
  },

  scenarios: [
    {
      scenarioId: "scenario-id",
      classification: "forecast",
      description: "Plausible future, not an observed fact",
      timeHorizon: {},
      assumptions: [],
      indicators: [],
      potentialConsequences: [],
      confidence: {},
      reassessmentTriggers: []
    }
  ],

  provenance: {
    trigger: "event",
    sourceRecordVersions: [],
    telvinRunRef: null
  },

  changeSummary: "What changed from the previous version",

  review: {
    required: true,
    status: "pending",
    reviewerRef: null
  },

  publishedTo: []
}
```

Define permitted enum values, validation rules, and relationships in the actual schemas. Do not use the illustrative values above as production contracts without review.

## 12. Security and resilience

S.I.I.T. must:

* Enforce authorization for reading, creating, reassessing, reviewing, and publishing assessments.
* Treat incoming source text as untrusted, including text passed to Telvin.
* Restrict sensitive evidence and assessment distribution.
* Make writes versioned and idempotent where possible.
* Handle duplicate events and out-of-order updates.
* Handle R.E.D. unavailability, Telvin timeouts, invalid AI responses, and persistence failures.
* Preserve the last successful assessment with a clear freshness or failure indicator.
* Audit material changes and human review actions.
* Monitor processing failures, reassessment delays, stale high-priority assessments, and publication failures.
* Keep credentials and sensitive operational details out of error messages and ordinary logs.

## 13. Outputs and downstream contracts

S.I.I.T. publishes structured, versioned assessments containing:

* Situation identity, scope, and assessment time.
* Evidence-based current situation summary.
* Threat hypotheses and supporting evidence references.
* Likelihood, potential impact, rationale, confidence, and uncertainty.
* Separate forward-looking scenarios and their assumptions.
* Priority and freshness metadata.
* Version and change summary.
* Review and publication status.

V.I.R.U.S. may consume relevant S.I.I.T. assessments as inputs to regional-urgency evaluation.

T.W.O W.E.E.K.S. should receive only the outputs authorized for its workflows, with decision ownership and approval requirements preserved.

Exact API routes, event names, queue behavior, retry policies, and payload schemas must be confirmed against the codebase before implementation.

## 14. Failure states

At minimum, account for:

* Missing or inaccessible R.E.D. evidence.
* Conflicting, retracted, or outdated information.
* Duplicate or out-of-order update events.
* Telvin timeout or malformed response.
* AI-generated claims without adequate support.
* Assessment validation failure.
* Database or publication failure.
* Delayed or missed reassessment triggers.
* Assessment freshness thresholds being exceeded.

Failures must produce traceable statuses and actionable operational signals. They must not disguise uncertainty as certainty.

## 15. Acceptance criteria

* [ ] Current assessments and forecasts are distinct in storage, APIs, and reports.
* [ ] Material conclusions link to source-backed R.E.D. records.
* [ ] Source verification status is preserved.
* [ ] AI output cannot corroborate itself.
* [ ] High-priority situations are monitored and reassessed through defined triggers.
* [ ] Other situations can be assessed on demand.
* [ ] Priority designations and changes are auditable.
* [ ] Assessments are versioned, timestamped, and include change summaries.
* [ ] Forecasts expose assumptions, indicators, time horizons, and uncertainty.
* [ ] Stale assessments and failed reassessments are clearly marked.
* [ ] Unsupported Telvin output cannot silently become a published conclusion.
* [ ] Access control and downstream publication rules are enforced.
* [ ] Tests cover normal workflows, integration contracts, and failure paths.

## 16. Repository checks before implementation

Before connecting this design to actual code, inspect:

1. Existing repository structure and naming conventions.
2. R.E.D.'s real record formats, identifiers, verification statuses, and update mechanisms.
3. Existing Appwrite collections, permissions, functions, and subscription or event mechanisms.
4. How G.R.O.A. currently invokes Telvin and validates its responses.
5. Existing authorization and human-review policies.
6. Actual V.I.R.U.S. and T.W.O W.E.E.K.S. integration contracts.
7. Current testing, logging, monitoring, and deployment conventions.

**Implementation rule:** Reuse suitable existing components, confirm the actual contracts, and only then create or modify code. This document defines the intended S.I.I.T. behavior; it does not claim the proposed architecture has already been implemented.
