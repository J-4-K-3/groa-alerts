
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiDatabase,
  FiFileText,
  FiSearch,
  FiMap,
  FiBarChart2,
  FiShield,
  FiClock,
  FiArrowRight,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import "./PopupStyles.css";

const requestTypes = [
  { value: "report", label: "Report or briefing", icon: FiFileText },
  { value: "regional", label: "Regional information", icon: FiMap },
  { value: "research", label: "Research data", icon: FiSearch },
  { value: "statistics", label: "Statistics or trends", icon: FiBarChart2 },
  { value: "other", label: "Other information", icon: FiDatabase },
];

const initialForm = {
  type: "report",
  title: "",
  details: "",
  reason: "",
  intendedUse: "",
  region: "",
  timeframe: "",
};

const RequestDataPopup = ({
  isOpen,
  onClose,
  onSubmitRequest,
  isSubmitting = false,
  submitError = "",
}) => {
  const [form, setForm] = useState(initialForm);

  if (!isOpen) return null;

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!onSubmitRequest || isSubmitting) return;

    await onSubmitRequest({
      ...form,
      submittedAt: new Date().toISOString(),
    });
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="request-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.section
          className="request-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-title"
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.22 }}
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
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
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Request Information</h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Tell us what you need and why it matters
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

          <div className="request-body">
            {/* Intro banner */}
            <section className="request-intro">
              <div className="request-intro-icon" style={{ marginLeft: 10 }}>
                <FiSearch />
              </div>

              <div>
                <h3>What information would help your work?</h3>
                <p>
                  Request information, research, regional context, statistics,
                  or a report. Each request is reviewed for relevance,
                  justification, feasibility, and responsible disclosure.
                </p>
              </div>
            </section>

            <form onSubmit={handleSubmit} className="request-form">
              {/* Request category */}
              <section className="request-section">
                <div className="request-section-heading">
                  <span className="request-step">01</span>
                  <div>
                    <h3>What are you looking for?</h3>
                    <p>Choose the closest category for your request.</p>
                  </div>
                </div>

                <div className="request-type-grid">
                  {requestTypes.map((item) => {
                    const Icon = item.icon;
                    const selected = form.type === item.value;

                    return (
                      <button
                        type="button"
                        key={item.value}
                        className={`request-type-card ${selected ? "selected" : ""
                          }`}
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            type: item.value,
                          }))
                        }
                        aria-pressed={selected}
                      >
                        <Icon />
                        <span>{item.label}</span>

                        {selected && (
                          <FiCheckCircle className="request-type-check" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Request details */}
              <section className="request-section">
                <div className="request-section-heading">
                  <span className="request-step">02</span>
                  <div>
                    <h3>Describe the information</h3>
                    <p>Be specific so the team can understand your needs.</p>
                  </div>
                </div>

                <div className="request-field">
                  <label htmlFor="request-subject">
                    Request title <span>*</span>
                  </label>
                  <input
                    id="request-subject"
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    placeholder="e.g. Regional security situation briefing"
                    maxLength={140}
                    required
                  />
                </div>

                <div className="request-field">
                  <label htmlFor="request-details">
                    What information do you need? <span>*</span>
                  </label>
                  <textarea
                    id="request-details"
                    name="details"
                    value={form.details}
                    onChange={updateField}
                    placeholder="Describe the questions you need answered, the specific data you're looking for, or the report you need..."
                    rows={4}
                    maxLength={5000}
                    required
                  />
                  <span className="request-field-hint">
                    {form.details.length}/5000 characters
                  </span>
                </div>

                <div className="request-two-columns">
                  <div className="request-field">
                    <label htmlFor="request-region">
                      Region or location
                    </label>
                    <input
                      id="request-region"
                      name="region"
                      value={form.region}
                      onChange={updateField}
                      placeholder="e.g. Kyiv, Gaza-strip, Sudan"
                      maxLength={200}
                    />
                  </div>

                  <div className="request-field">
                    <label htmlFor="request-timeframe">
                      Relevant time period
                    </label>
                    <input
                      id="request-timeframe"
                      name="timeframe"
                      value={form.timeframe}
                      onChange={updateField}
                      placeholder="e.g. Past 30 days"
                      maxLength={200}
                    />
                  </div>
                </div>
              </section>

              {/* Justification */}
              <section className="request-reason-card">
                <div className="request-reason-heading">
                  <div className="request-reason-icon">
                    <FiShield />
                  </div>

                  <div>
                    <span className="request-section-label">
                      REQUIRED FOR REVIEW
                    </span>
                    <h3>Why do you need this information?</h3>
                  </div>
                </div>

                <p className="request-reason-description">
                  Explain the purpose of your request and how the information
                  will be used. Requests are evaluated on their legitimate
                  purpose, relevance, and potential risks—not simply on how
                  urgently the information is requested.
                </p>

                <div className="request-field">
                  <label htmlFor="request-reason">
                    Your justification <span>*</span>
                  </label>
                  <textarea
                    id="request-reason"
                    name="reason"
                    value={form.reason}
                    onChange={updateField}
                    placeholder="Explain why this information is needed, what decision or work it will support, and why existing public information is insufficient..."
                    rows={5}
                    maxLength={4000}
                    required
                  />
                  <span className="request-field-hint">
                    {form.reason.length}/4000 characters
                  </span>
                </div>

                <div className="request-field">
                  <label htmlFor="request-use">
                    How will you use the information? <span>*</span>
                  </label>
                  <textarea
                    id="request-use"
                    name="intendedUse"
                    value={form.intendedUse}
                    onChange={updateField}
                    placeholder="e.g. To prepare a research report, support humanitarian planning, or understand a developing situation..."
                    rows={3}
                    maxLength={2000}
                    required
                  />
                </div>

                <div className="request-review-note">
                  <FiInfo />
                  <p>
                    A request may be declined or limited if the justification
                    is insufficient, the data is unavailable, or disclosure
                    would create privacy, safety, confidentiality, or security
                    risks. A valid purpose does not guarantee access.
                  </p>
                </div>
              </section>

              {/* Review expectations */}
              <section className="request-review-strip">
                <div>
                  <FiShield style={{ marginLeft: 10 }} />
                  <span>Responsible review</span>
                </div>
                <div>
                  <FiClock />
                  <span>Subject to availability</span>
                </div>
                <div>
                  <FiDatabase />
                  <span>Access assessed individually</span>
                </div>
              </section>

              {submitError && (
                <div className="request-error" role="alert">
                  {submitError}
                </div>
              )}

              {/* Submit */}
              <div className="request-submit-area">
                <p>
                  Submitting a request does not guarantee approval or immediate
                  delivery. Do not include passwords, private credentials, or
                  unnecessary sensitive personal information.
                </p>

                <div className="request-submit-actions">
                  <button
                    type="button"
                    className="request-cancel-button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="request-submit-button"
                    disabled={isSubmitting || !onSubmitRequest}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="request-spinner" />
                        Submitting request...
                      </>
                    ) : (
                      <>
                        Submit for review
                        <FiArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default RequestDataPopup;
