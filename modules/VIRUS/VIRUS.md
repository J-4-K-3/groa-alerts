# V.I.R.U.S.

## Verified Intelligence for Regional Urgency Situations

**Project:** G.R.O.A. — Threat Alert and Intelligence System
**Module:** V.I.R.U.S.
**Full Name:** Verified Intelligence for Regional Urgency Situations
**Status:** Architecture specification
**Version:** 1.0

---

## 1. Purpose

V.I.R.U.S. is G.R.O.A.'s urgency classification, regional prioritization, and escalation recommendation module.

Its purpose is to determine how urgently individual situations and affected regions require attention, identify interactions between situations, and recommend appropriate review or response pathways based on available intelligence.

V.I.R.U.S. operates on evidence and assessments supplied by upstream modules. It does not independently establish facts, replace threat analysis, or exercise operational authority.

Its central question is:

> Given the current evidence, assessed threats, time sensitivity, geographic exposure, and interactions between situations, what requires attention first, how urgent is it, and what action should be considered next?

V.I.R.U.S. evaluates urgency at two levels:

1. **Individual situation urgency:** The urgency associated with a specific assessed situation.
2. **Aggregate regional urgency:** The urgency associated with the combined state of relevant situations affecting a geographic region.

Both levels must be traceable to their inputs, rationale, and assessment history.

## 2. Architectural Position

V.I.R.U.S. operates between S.I.I.T. and T.W.O W.E.E.K.S. in G.R.O.A.'s intelligence-to-response pipeline.

```text
R.E.D.
Researched Emerging Data
        |
        v
S.I.I.T.
Situational Intelligence for Incoming Threats
        |
        v
V.I.R.U.S.
Verified Intelligence for Regional Urgency Situations
        |
        v
T.W.O W.E.E.K.S.
Threat Warning Operations for War Evacuations,
Escalations and Keeping Safety
```

### 2.1 Upstream dependencies

**R.E.D. — Researched Emerging Data**

Provides researched information, source references, evidence records, verification statuses, updates, corrections, and relevant provenance.

V.I.R.U.S. may use these records to understand the evidentiary basis of an assessment, but it must not independently convert unverified reports into confirmed facts.

**S.I.I.T. — Situational Intelligence for Incoming Threats**

Provides situation assessments, identified threats, relevant indicators, forecasts, uncertainty, geographic and temporal context, and assessment updates.

S.I.I.T. is the primary upstream source of interpreted situation intelligence for V.I.R.U.S.

### 2.2 Downstream dependency

**T.W.O W.E.E.K.S. — Threat Warning Operations for War Evacuations, Escalations and Keeping Safety**

Consumes relevant urgency classifications and recommendations to support its designated warning and evacuation-related operational workflows.

V.I.R.U.S. does not assume T.W.O W.E.E.K.S.' operational responsibilities. Recommendations must not be represented as authorized orders or completed operational actions.

### 2.3 Independence of responsibility

Each module has a distinct responsibility:

* R.E.D. researches and organizes information.
* S.I.I.T. interprets situations and assesses threats.
* V.I.R.U.S. classifies urgency and prioritizes attention.
* T.W.O W.E.E.K.S. manages its designated operational workflows under applicable authorization rules.

This separation prevents urgency classification, threat interpretation, and operational authorization from becoming one uncontrolled process.

## 3. Core Responsibilities

V.I.R.U.S. is responsible for the following functions.

### 3.1 Individual situation classification

Assign an urgency classification to an assessed situation using available threat assessments, potential consequences, time sensitivity, exposure, evidence quality, uncertainty, and applicable policy.

Each classification must include a rationale and references to its supporting assessments.

### 3.2 Regional urgency assessment

Build an aggregate picture of situations affecting a defined geographic region.

Regional assessment must consider:

* Individual situation urgency.
* Potential severity and time sensitivity.
* Geographic distribution and overlapping exposure.
* Interactions between incidents.
* Shared infrastructure and critical service dependencies.
* Potentially compounding effects.
* Changes in the overall regional situation.
* Evidence quality, freshness, and uncertainty.
* Relevant changes to contributing situation assessments.

A regional assessment must not be calculated solely by averaging individual urgency levels.

A single severe incident can dominate regional urgency. Multiple less severe incidents can also combine into a more serious situation when their effects interact.

### 3.3 Cross-situation correlation

Identify meaningful relationships between situations, including:

* Multiple incidents affecting the same area.
* Incidents competing for the same roads, facilities, resources, or services.
* One incident obstructing a response to another.
* Multiple hazards affecting the same population.
* Changes that collectively indicate regional deterioration.

Correlations must be supported by identifiable inputs and a recorded rationale. A suspected relationship must not automatically be treated as a verified causal relationship.

### 3.4 Escalation recommendation

Recommend review, escalation, monitoring, or response-preparation pathways when urgency criteria indicate that additional attention may be warranted.

Recommendations must explain why the proposed next step is appropriate and identify the evidence or assessment changes that prompted it.

### 3.5 Change detection

Track changes in individual and regional urgency over time.

V.I.R.U.S. should be able to identify:

* Increasing urgency.
* Decreasing urgency.
* Newly elevated situations.
* Material changes to contributing assessments.
* Stale or invalidated conclusions.
* Conflicting assessments.
* Newly identified regional interactions.

A change in classification must be explainable through recorded inputs and the applicable assessment logic.

### 3.6 Assessment history

Maintain versioned records of classifications, rationale, inputs, policy versions, recommendations, uncertainty, and material changes.

Historical assessments must remain distinguishable from current assessments.

## 4. Urgency Classification Model

V.I.R.U.S. uses five numbered urgency levels and two separate assessment states.

The five levels form the standard classification scale. Detailed thresholds, indicators, and policy rules should be configurable and versioned rather than embedded as unexplained constants throughout the codebase.

### Level 1 — Routine

The available assessment does not establish elevated urgency.

Expected handling may include ordinary monitoring, routine review, or reassessment according to policy.

Routine does not mean that the situation has no risk. It means that the current assessment supports the routine classification.

### Level 2 — Elevated

The situation warrants increased attention.

Potential handling may include closer monitoring, additional evidence collection, or reassessment when new information becomes available.

### Level 3 — High

The situation presents significant concerns that warrant prompt review.

Potential handling may include prioritized assessment, review by a responsible operator, or consideration of response preparation.

### Level 4 — Very High

The situation presents serious and time-sensitive concerns.

Potential handling includes urgent review, explicit escalation recommendations, and consideration of appropriate response pathways by authorized decision-makers.

### Level 5 — Critical

Available evidence indicates potentially severe, time-critical consequences.

V.I.R.U.S. should recommend immediate authorized review and clearly communicate the supporting rationale, time sensitivity, uncertainty, and relevant response considerations.

A Critical classification does not itself authorize an evacuation, public warning, or other operational action.

### Separate state — Unassessed

No valid urgency classification has been completed.

This state must not be interpreted as Routine, safe, low risk, or evidence of no threat.

### Separate state — Uncertain / Conflicted

An assessment has been attempted, but the available information is insufficient, stale, contradictory, or otherwise unsuitable for a reliable classification.

Where a high-consequence threat may be time-sensitive, uncertainty may justify urgent review rather than a lower urgency classification.

The system must preserve the distinction between the severity of a potential threat and confidence in the evidence supporting it.

### 4.1 Classification requirements

Every published urgency assessment must specify:

* Its classification or separate assessment state.
* Its assessment scope.
* Its rationale.
* Its supporting inputs.
* Its assessment timestamp.
* Its applicable policy version.
* Its uncertainty and known limitations.
* Its recommended next steps, where appropriate.

The system must not silently convert missing information into a low urgency classification.

## 5. Individual Situation Assessment

Individual assessment determines the urgency associated with one situation using the relevant S.I.I.T. assessment and supporting intelligence.

The assessment process should consider:

1. Potential severity of consequences.
2. Time until potential impact.
3. Population, infrastructure, or services potentially exposed.
4. Geographic scope.
5. Evidence quality and freshness.
6. Threat-assessment uncertainty.
7. Relevant indicators and changes.
8. Applicable classification policies.

The implementation must distinguish confirmed observations, reported claims, assessed threats, and forecasts.

Forecasts must not be represented as confirmed events. Where forecast information affects urgency, the assessment should identify its assumptions, time horizon, and uncertainty.

Individual urgency describes the priority warranted by the current assessment. It does not replace S.I.I.T.'s underlying threat assessment.

## 6. Aggregate Regional Assessment

Regional assessment combines relevant individual assessments into a broader geographic picture.

### 6.1 Regional scope

Each regional assessment must identify the geographic scope being evaluated, the relevant time window, and the contributing situation assessments.

Regional boundaries and geographic identifiers should use consistent representations across G.R.O.A.

### 6.2 Regional urgency factors

The regional assessment should consider:

* The urgency and severity of contributing situations.
* The number and geographic concentration of affected situations.
* Overlapping exposure.
* Dependencies between incidents and critical services.
* Shared access routes or infrastructure.
* Potentially compounding effects.
* Regional deterioration or improvement over time.
* Confidence and freshness of the contributing assessments.
* Material gaps or contradictions in the available intelligence.

These factors should be evaluated through explicit, testable policy logic.

A simple mean of urgency levels is insufficient. The system should support rules for dominant severe incidents, compounding effects, geographic overlap, and material dependencies.

### 6.3 Regional conclusions

Every regional assessment must explain:

* The assigned regional urgency.
* The main contributing situations.
* Which factors most influenced the result.
* Whether interactions materially increased or changed urgency.
* What uncertainty remains.
* Which situations or locations warrant priority attention.
* What review or response pathways are recommended.

### 6.4 Regional assessment limitations

An aggregate regional classification must not hide an individual Critical situation.

The regional view must preserve access to individual classifications and support drill-down into contributing assessments.

Similarly, a regional classification must not be described as a uniform risk level for every location within the region. Where risks differ geographically, the assessment must preserve those distinctions.

## 7. Hybrid Reassessment Policy

V.I.R.U.S. uses a hybrid reassessment model. It does not continuously recompute every situation and region without regard to relevance.

Reassessment occurs in response to material events, scheduled freshness checks, and authorized requests.

### 7.1 Event-driven reassessment

Reassess an individual situation when a material change occurs, such as:

* A contributing S.I.I.T. assessment changes.
* Relevant evidence is added, corrected, retracted, or invalidated.
* A significant indicator changes.
* An assessment is identified as stale or unreliable.
* A relevant relationship with another situation is discovered.
* An authorized operator requests reassessment.

Only events that may materially affect the assessment should trigger the relevant work.

### 7.2 Regional impact propagation

When a contributing individual assessment changes, identify the regional assessments that depend on it.

Reassess affected regions when the change could alter their conclusions.

Examples include:

* A situation becoming Critical.
* A previously significant threat being retracted.
* A shared access route becoming unavailable.
* Several incidents beginning to affect the same critical service.
* A contributing assessment becoming uncertain or outdated.

Unrelated regions should not be recomputed unnecessarily.

### 7.3 Scheduled freshness checks

Run scheduled checks according to configured policy.

These checks should identify assessments that have become stale, missing updates, expired evidence references, or regional conclusions that require renewed evaluation.

Check frequency may vary by urgency, situation type, volatility, and policy.

A scheduled check does not imply that an assessment must change. It determines whether reassessment is required.

### 7.4 Authorized manual reassessment

Authorized operators may request reassessment of a specific situation, region, or defined set of assessments.

Manual requests should record the requester, time, scope, and reason when applicable to the authorization and audit model.

### 7.5 Reassessment priority

High-priority and time-sensitive situations should receive more frequent review according to policy.

Lower-priority situations may use less frequent scheduled checks and event-driven reassessment.

Priority must be explicit and auditable. An AI-generated suggestion must not silently change monitoring priority without applying the relevant authorization and policy rules.

### 7.6 Reassessment failures

If reassessment fails, V.I.R.U.S. must not silently treat an old result as freshly confirmed.

The system should preserve the last known assessment, mark its freshness or processing status appropriately, record the failure, and recommend review when warranted.

## 8. Processing Pipeline

The logical processing pipeline is:

1. **Receive:** Consume new or updated S.I.I.T. assessments and relevant evidence references.
2. **Validate:** Check input structure, provenance, freshness, and compatibility.
3. **Normalize:** Standardize geographic identifiers, timestamps, assessment references, and urgency inputs.
4. **Assess individual urgency:** Apply the configured classification policy.
5. **Identify relationships:** Evaluate relevant links between situations.
6. **Build regional views:** Identify affected regions and their contributing assessments.
7. **Assess regional urgency:** Evaluate combined conditions and interactions.
8. **Evaluate uncertainty:** Identify stale, incomplete, contradictory, or insufficient inputs.
9. **Recommend next steps:** Generate policy-grounded review, escalation, monitoring, or response-preparation recommendations.
10. **Validate output:** Ensure that the classification, rationale, references, and recommendations are consistent and complete.
11. **Publish:** Store and distribute authorized assessment updates to approved consumers.
12. **Track changes:** Record version history and determine whether downstream assessments require reconsideration.

Processing should be idempotent where practical: retrying the same input event must not create duplicate logical assessments or duplicate recommendations.

## 9. Telvin Integration

Telvin may assist V.I.R.U.S. with analytical and explanatory tasks, including:

* Summarizing individual and regional assessments.
* Comparing assessment versions.
* Identifying possible cross-situation relationships.
* Explaining why urgency changed.
* Highlighting missing information.
* Proposing hypotheses for review.
* Drafting human-readable rationale and recommendations.

Telvin must not be treated as an authoritative evidence source or independent decision-maker.

### 9.1 AI boundaries

Telvin must not:

* Invent evidence, sources, or assessment references.
* Present an unverified claim as established fact.
* Convert a forecast into a confirmed incident.
* Independently authorize an escalation or evacuation.
* Silently override the configured classification policy.
* Change monitoring priority without the applicable policy and authorization.
* Hide uncertainty or contradictory evidence.
* Publish unsupported urgency conclusions.

### 9.2 Deterministic validation

AI-assisted outputs must be checked against the available structured inputs and applicable policy.

Urgency classifications should be produced through explicit, testable rules or other formally governed assessment logic. If a model contributes to a classification, its role, version, limitations, and validation requirements must be documented.

AI-generated summaries and hypotheses should remain distinguishable from evidence-backed conclusions.

## 10. Logical Components

The following are **proposed logical components**, not claims about existing repository files. Actual paths and boundaries must be aligned with G.R.O.A.'s implementation before integration.

| Component                   | Responsibility                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `virusService`              | Coordinate the V.I.R.U.S. assessment lifecycle                                          |
| `assessmentInputAdapter`    | Consume S.I.I.T. assessments and relevant references                                    |
| `inputValidationService`    | Validate structure, freshness, and input compatibility                                  |
| `individualUrgencyService`  | Classify individual situation urgency                                                   |
| `regionalAssessmentService` | Build and assess aggregate regional conditions                                          |
| `correlationService`        | Identify and track relationships between situations                                     |
| `urgencyPolicyEngine`       | Apply versioned classification and escalation criteria                                  |
| `reassessmentService`       | Handle event-driven, scheduled, and manual reassessment                                 |
| `impactPropagationService`  | Identify affected regional assessments after material changes                           |
| `recommendationService`     | Produce policy-grounded next-step recommendations                                       |
| `telvinAdapter`             | Integrate AI-assisted analysis and explanations                                         |
| `assessmentValidator`       | Validate classifications, rationale, references, and output consistency                 |
| `assessmentRepository`      | Persist versioned individual and regional assessments                                   |
| `publicationService`        | Publish authorized assessment updates to approved consumers                             |
| `auditService`              | Record material changes, policy versions, processing results, and authorization context |

Supporting schemas, configuration, policies, and tests should be separated from business logic wherever the existing architecture permits.

Do not create duplicate services if equivalent responsibilities already exist elsewhere in G.R.O.A. Reuse existing infrastructure where appropriate.

## 11. Proposed Data Structures

The following examples illustrate the logical data contract. They are not a declaration of the current database schema.

### 11.1 Individual urgency assessment

```json
{
  "assessmentId": "example-assessment-id",
  "version": 1,
  "scope": "individual",
  "situationId": "example-situation-id",
  "regionIds": ["example-region-id"],
  "urgencyLevel": 3,
  "assessmentState": "assessed",
  "rationale": "Example rationale supported by referenced inputs.",
  "sourceAssessmentRefs": [
    "example-siit-assessment-id"
  ],
  "evidenceRefs": [
    "example-evidence-id"
  ],
  "uncertainty": {
    "status": "present",
    "summary": "Example limitation requiring consideration."
  },
  "policyVersion": "example-policy-version",
  "recommendations": [
    {
      "type": "priority_review",
      "reason": "Example policy-grounded recommendation."
    }
  ],
  "assessedAt": "2026-10-09T10:00:00Z",
  "freshnessStatus": "current"
}
```

### 11.2 Regional urgency assessment

```json
{
  "assessmentId": "example-regional-assessment-id",
  "version": 1,
  "scope": "regional",
  "regionId": "example-region-id",
  "urgencyLevel": 4,
  "assessmentState": "assessed",
  "contributingAssessmentRefs": [
    "example-assessment-1",
    "example-assessment-2"
  ],
  "interactionRefs": [
    "example-interaction-id"
  ],
  "rationale": "Example regional rationale.",
  "dominantFactors": [
    "time_sensitivity",
    "critical_service_dependency"
  ],
  "uncertainty": {
    "status": "present",
    "summary": "Example regional evidence limitation."
  },
  "policyVersion": "example-policy-version",
  "recommendations": [
    {
      "type": "urgent_authorized_review",
      "reason": "Example recommendation requiring human review."
    }
  ],
  "assessedAt": "2026-10-09T10:00:00Z",
  "freshnessStatus": "current"
}
```

### 11.3 Schema considerations

The examples are illustrative. Before implementation:

* Define allowed values for urgency levels and assessment states.
* Decide whether the database represents uncertainty as an assessment state, a separate confidence field, or both.
* Use actual identifiers and timestamp conventions from G.R.O.A.
* Validate all references against authorized data sources.
* Define the schema for recommendations and interaction records.
* Specify how corrections, superseded assessments, and failed reassessments are represented.
* Ensure assessment versions cannot silently overwrite the audit history.

A value such as `urgencyLevel: 3` is meaningful only when its accompanying assessment state indicates that a valid classification was completed. Unassessed or uncertain records must not be misrepresented as numbered urgency levels.

## 12. Recommendation Model

Recommendations describe suggested next steps; they do not represent completed actions.

Possible recommendation categories include:

* `routine_monitoring`
* `increased_monitoring`
* `priority_review`
* `urgent_authorized_review`
* `request_siit_reassessment`
* `regional_review`
* `response_preparation_review`
* `evidence_gap_review`

The final list should be aligned with actual operational capabilities and approved policy.

Every recommendation should identify:

* The recommended pathway.
* The reason for the recommendation.
* Its supporting assessment references.
* Its urgency and relevant time sensitivity.
* Any uncertainty or prerequisites.
* The responsible review pathway, where defined.
* Its status, if the system tracks whether it was acknowledged or resolved.

V.I.R.U.S. must not label a recommendation as approved, executed, or completed unless that state is confirmed by the responsible system or authorized actor.

## 13. Security, Governance, and Auditability

V.I.R.U.S. may process sensitive information about threats, affected populations, infrastructure, and operational priorities.

The implementation should follow G.R.O.A.'s established security and data-governance conventions.

Requirements include:

* Access controls for assessments and sensitive regional information.
* Authorization checks for manual reassessment and policy changes.
* Validation of incoming events and identifiers.
* Protection against unauthorized modification of assessments.
* Traceable policy and configuration versions.
* Audit records for material classification changes and recommendations.
* Controlled publication to downstream consumers.
* Protection against duplicate, stale, or replayed events.
* Appropriate handling of failed processing and unavailable dependencies.
* Retention rules for current and historical assessments.

Logs should provide sufficient diagnostic and audit information without unnecessarily exposing sensitive source material or personal information.

## 14. Failure Handling

V.I.R.U.S. must handle upstream failures and incomplete data explicitly.

### S.I.I.T. unavailable

Do not fabricate an assessment. Preserve existing records with their actual freshness state and flag any dependent conclusions that require review.

### R.E.D. evidence corrected or retracted

Determine which contributing assessments and regional conclusions may be affected. Trigger targeted reassessment when material.

### Conflicting inputs

Preserve the conflict, mark uncertainty appropriately, and recommend review when warranted.

### Stale inputs

Do not present stale assessments as newly confirmed. Apply freshness policies and identify affected conclusions.

### Telvin unavailable

Core classification and reassessment should continue wherever the deterministic policy and required structured inputs permit. AI-assisted summaries may be unavailable without invalidating otherwise valid policy-based results.

### Reassessment failure

Record the failure, retain the last known result with its actual timestamp, and prevent downstream consumers from mistaking it for a newly completed assessment.

### Publication failure

Record the publication status and retry according to the existing delivery architecture. Do not claim that downstream consumers received an update until delivery is confirmed.

## 15. Testing and Acceptance Criteria

V.I.R.U.S. is ready for integration only when its behavior is verifiable.

### Individual classification

* Valid inputs produce a classification consistent with the configured policy.
* Missing or invalid inputs cannot silently produce a Routine classification.
* Unassessed and Uncertain / Conflicted remain distinct from numbered urgency levels.
* Forecasts remain distinguishable from confirmed observations.
* Each published result contains its rationale and supporting references.

### Regional assessment

* Regional urgency is derived from contributing assessments and explicit regional rules.
* A severe incident is not hidden by averaging it with less urgent situations.
* Multiple interacting incidents can increase regional urgency when justified by policy.
* Unrelated incidents do not automatically produce an unsupported regional escalation.
* Users can inspect the contributing assessments behind a regional result.
* Regional classifications do not erase meaningful geographic differences.

### Hybrid reassessment

* Material upstream changes trigger targeted reassessment.
* Regional assessments are reconsidered when a contributing situation could materially affect them.
* Scheduled freshness checks identify stale assessments.
* Authorized manual reassessment requests are handled and recorded.
* Unrelated regions are not unnecessarily recomputed.
* Failed reassessment does not falsely refresh an old result.

### AI and authority

* Telvin cannot invent or silently alter source evidence.
* AI-assisted analysis is distinguishable from validated conclusions.
* Recommendations cannot be mistaken for authorized orders.
* No evacuation order is issued by V.I.R.U.S.
* Policy and authorization checks are applied where required.

### Reliability and audit

* Duplicate events do not create duplicate logical outcomes.
* Material changes have traceable versions and rationales.
* Failed dependencies and publication attempts are represented accurately.
* Classification behavior is covered by unit, integration, and regression tests.

## 16. Implementation Guidance

Before coding:

1. Inspect the current G.R.O.A. repository and identify existing service, storage, event, and authorization conventions.
2. Map the proposed logical components to actual modules and paths.
3. Confirm the real S.I.I.T. assessment contract and R.E.D. evidence references.
4. Define versioned urgency policies and regional assessment rules.
5. Finalize schemas and allowed states.
6. Implement individual classification before regional aggregation.
7. Implement dependency tracking and hybrid reassessment.
8. Add recommendation generation and controlled publication.
9. Integrate Telvin through a validated adapter.
10. Add tests for urgency classification, regional interactions, stale inputs, failure handling, and authorization boundaries.

Do not assume that the proposed component names, schemas, event mechanisms, or paths already exist. Adapt this specification to the repository rather than building a parallel architecture unnecessarily.

## 17. Final Design Principle

V.I.R.U.S. exists to make urgency understandable, comparable, and actionable without confusing analysis with authority.

It must explain not only **how urgent a situation appears**, but also **why it received that classification, what could change the conclusion, which other situations are affected, and what should be reviewed next**.

Its classifications should be evidence-grounded, its regional picture should preserve individual risks, its reassessment should be responsive and efficient, and its recommendations should remain subject to the appropriate operational authorization.

**V.I.R.U.S. classifies urgency, prioritizes attention, and recommends pathways. Authorized decision-makers and designated operational modules retain authority over response actions.**
