
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiAlertTriangle,
  FiShield,
  FiLink,
  FiSend,
  FiCheckCircle,
} from "react-icons/fi";
import "./PopupStyles.css";

const initialForm = {
  type: "inaccuracy",
  title: "",
  details: "",
  location: "",
  reference: "",
  evidence: "",
  severity: "medium",
  contact: "",
};

const issueTypes = [
  { value: "misinformation", label: "Misinformation", description: "Information that may be false or misleading" },
  { value: "inaccuracy", label: "Inaccurate information", description: "Incorrect facts, figures, or descriptions" },
  { value: "outdated", label: "Outdated information", description: "Information that is no longer current" },
  { value: "source", label: "Source problem", description: "Missing, unreliable, or misrepresented sources" },
  { value: "technical", label: "Technical bug", description: "A broken feature, display, or unexpected behaviour" },
  { value: "other", label: "Other issue", description: "Something else that needs attention" },
];

const severityLevels = [
  {
    value: "low",
    label: "Low",
    description: "Minor issue with limited impact",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Affects usefulness or understanding",
  },
  {
    value: "high",
    label: "High",
    description: "May significantly mislead users or affect decisions",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Potential immediate safety or serious information risk",
  },
];

const ReportIssuePopup = ({
  isOpen,
  onClose,
  onSubmitReport,
  isSubmitting = false,
  submitError = "",
}) => {
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState("");

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setValidationError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.details.trim()) {
      setValidationError("Add a title and explain the issue before submitting.");
      return;
    }

    if (!onSubmitReport) {
      setValidationError("Report submission is not configured yet.");
      return;
    }

    try {
      await onSubmitReport({
        ...form,
        title: form.title.trim(),
        details: form.details.trim(),
        location: form.location.trim(),
        reference: form.reference.trim(),
        evidence: form.evidence.trim(),
        contact: form.contact.trim(),
        submittedAt: new Date().toISOString(),
      });
    } catch {
      // The parent should provide the actual error through submitError.
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="report-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.section
          className="report-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Report an Issue</h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Help us identify misinformation, inaccuracies, and
                  problems across the platform.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "var(--hover-bg)")
              }
              onMouseLeave={(e) => (e.target.style.background = "none")}
            >
              <FiX />
            </button>
          </div>

          <form className="report-form" onSubmit={handleSubmit}>
            <div className="report-intro">
              <FiShield />
              <p>
                Every report can be reviewed. Provide as much detail as
                you can so the team can investigate it accurately.
              </p>
            </div>

            <section className="report-section">
              <div className="report-section-heading">
                <span className="report-step">01</span>
                <div>
                  <h3>What are you reporting?</h3>
                  <p>Select the category that best describes the issue.</p>
                </div>
              </div>

              <div className="report-type-grid">
                {issueTypes.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    className={`report-type-card ${form.type === item.value ? "selected" : ""
                      }`}
                    aria-pressed={form.type === item.value}
                    onClick={() => updateField("type", item.value)}
                  >
                    <span className="report-type-title">{item.label}</span>
                    <span className="report-type-description">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="report-section">
              <div className="report-section-heading">
                <span className="report-step">02</span>
                <div>
                  <h3>Describe the issue</h3>
                  <p>Tell us what is wrong and what needs attention.</p>
                </div>
              </div>

              <div className="report-field">
                <label htmlFor="report-issue-title">
                  Issue title <span>*</span>
                </label>
                <input
                  id="report-issue-title"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Incorrect timeline in a crisis report"
                  maxLength={160}
                  required
                />
              </div>

              <div className="report-field">
                <label htmlFor="report-issue-details">
                  Detailed explanation <span>*</span>
                </label>
                <textarea
                  id="report-issue-details"
                  value={form.details}
                  onChange={(e) => updateField("details", e.target.value)}
                  placeholder="What did you notice? What appears incorrect or broken? Include relevant context."
                  rows={5}
                  maxLength={5000}
                  required
                />
                <span className="report-character-count">
                  {form.details.length}/5000
                </span>
              </div>

              <div className="report-field-row">
                <div className="report-field">
                  <label htmlFor="report-location">
                    Where did it happen?
                  </label>
                  <input
                    id="report-location"
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="e.g. Alerts, News, Full Map"
                    maxLength={200}
                  />
                </div>

                <div className="report-field">
                  <label htmlFor="report-reference">
                    Link or reference ID
                  </label>
                  <input
                    id="report-reference"
                    value={form.reference}
                    onChange={(e) => updateField("reference", e.target.value)}
                    placeholder="Alert ID, report ID, or URL"
                    maxLength={1000}
                  />
                </div>
              </div>
            </section>

            <section className="report-section">
              <div className="report-section-heading">
                <span className="report-step">03</span>
                <div>
                  <h3>Evidence and impact</h3>
                  <p>Help reviewers understand the issue and its importance.</p>
                </div>
              </div>

              <div className="report-field">
                <label htmlFor="report-evidence">
                  Supporting evidence <span className="report-optional">(optional)</span>
                </label>
                <div className="report-input-with-icon">
                  <FiLink />
                  <textarea
                    id="report-evidence"
                    value={form.evidence}
                    onChange={(e) => updateField("evidence", e.target.value)}
                    placeholder="Add source URLs, relevant quotations, or other supporting details."
                    rows={3}
                    maxLength={5000}
                  />
                </div>
                <span className="report-hint">
                  Separate multiple links or references with a new line.
                </span>
              </div>

              <div className="report-field">
                <label>How serious is the issue?</label>
                <div className="report-severity-grid">
                  {severityLevels.map((level) => (
                    <button
                      type="button"
                      key={level.value}
                      className={`report-severity report-severity-${level.value} ${form.severity === level.value ? "selected" : ""
                        }`}
                      aria-pressed={form.severity === level.value}
                      onClick={() => updateField("severity", level.value)}
                    >
                      <span className="report-severity-label">
                        {level.label}
                      </span>
                      <span className="report-severity-description">
                        {level.description}
                      </span>
                    </button>
                  ))}
                </div>
                <span className="report-hint">
                  Severity indicates your assessment and does not determine
                  the review outcome.
                </span>
              </div>
            </section>

            <section className="report-section">
              <div className="report-section-heading">
                <span className="report-step">04</span>
                <div>
                  <h3>Follow-up</h3>
                  <p>Optional contact information if you want a response.</p>
                </div>
              </div>

              <div className="report-field">
                <label htmlFor="report-contact">
                  Email or preferred contact method{" "}
                  <span className="report-optional">(optional)</span>
                </label>
                <input
                  id="report-contact"
                  value={form.contact}
                  onChange={(e) => updateField("contact", e.target.value)}
                  placeholder="How can the team reach you?"
                  maxLength={320}
                />
                <span className="report-hint">
                  Only collect and use contact details according to G.R.O.A.'s
                  privacy policy.
                </span>
              </div>
            </section>

            <div className="report-review-note">
              <FiShield />
              <div>
                <strong>Reports are reviewed before action is taken.</strong>
                <p>
                  Submitting a report does not automatically change published
                  intelligence. Urgent safety concerns should be clearly
                  identified in your explanation.
                </p>
              </div>
            </div>

            {(validationError || submitError) && (
              <div className="report-error" role="alert">
                {validationError || submitError}
              </div>
            )}

            <footer className="report-footer">
              <span className="report-required-note">
                <span>*</span> Required fields
              </span>

              <div className="report-footer-actions">
                <button
                  type="button"
                  className="report-cancel"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="report-submit"
                  disabled={isSubmitting || !onSubmitReport}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <FiSend />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </footer>
          </form>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportIssuePopup;
