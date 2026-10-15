
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiX,
  FiLifeBuoy,
  FiLayers,
  FiMonitor,
  FiTool,
  FiLink,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiSend,
  FiAlertCircle,
} from "react-icons/fi";
import "./PopupStyles.css";

const categories = [
  { value: "feature", label: "New feature", icon: FiLifeBuoy },
  { value: "screen", label: "New screen", icon: FiMonitor },
  { value: "improvement", label: "Improvement", icon: FiTool },
  { value: "integration", label: "Integration", icon: FiLink },
  { value: "other", label: "Other", icon: FiLayers },
];

const initialForm = {
  title: "",
  category: "feature",
  problem: "",
  solution: "",
  beneficiaries: "everyone",
  priority: "medium",
  details: "",
};

const FeaturePopup = ({
  isOpen,
  onClose,
  onSubmitRequest,
  isSubmitting = false,
  submitError = "",
}) => {
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setLocalError("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (!form.title.trim() || !form.problem.trim() || !form.solution.trim()) {
      setLocalError("Please complete the title, problem, and proposed solution.");
      return;
    }

    if (typeof onSubmitRequest !== "function") {
      setLocalError("Feature requests cannot be submitted right now. Please try again later.");
      return;
    }

    try {
      await onSubmitRequest({
        ...form,
        title: form.title.trim(),
        problem: form.problem.trim(),
        solution: form.solution.trim(),
        details: form.details.trim(),
        submittedAt: new Date().toISOString(),
      });

      setSuccess(true);
    } catch {
      setLocalError("We couldn't submit your request. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="feature-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.section
          className="feature-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feature-title"
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
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Feature Request</h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Help shape the future of G.R.O.A
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

          <div className="feature-body">
            {success ? (
              <motion.div
                className="feature-success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="feature-success-icon">
                  <FiCheckCircle />
                </div>
                <h3>Request submitted</h3>
                <p>
                  Thank you for helping improve G.R.O.A. Your suggestion has
                  been submitted for review.
                </p>
                <div className="feature-review-note">
                  <FiShield />
                  <span>
                    Every request is reviewed for usefulness, feasibility,
                    safety, and alignment with the platform.
                  </span>
                </div>
                <button
                  type="button"
                  className="feature-submit"
                  onClick={() => {
                    setForm(initialForm);
                    setSuccess(false);
                    onClose();
                  }}
                >
                  Done <FiArrowRight />
                </button>
              </motion.div>
            ) : (
              <form className="feature-form" onSubmit={handleSubmit}>
                <div className="feature-intro">
                  <span className="feature-eyebrow">
                    <FiLifeBuoy /> COMMUNITY IDEAS
                  </span>
                  <h3>What should we build next?</h3>
                  <p>
                    Suggest a feature, screen, or improvement that could make
                    G.R.O.A. more useful.
                  </p>
                </div>

                <div className="feature-field">
                  <label htmlFor="feature-request-title">
                    Feature title <span>*</span>
                  </label>
                  <input
                    id="feature-request-title"
                    type="text"
                    maxLength={120}
                    placeholder="e.g. Community Evacuation Planner"
                    value={form.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    required
                  />
                  <small>{form.title.length}/120 characters</small>
                </div>

                <fieldset className="feature-field">
                  <legend>Request category <span>*</span></legend>
                  <div className="feature-category-grid">
                    {categories.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        className={`feature-category ${form.category === value ? "selected" : ""
                          }`}
                        aria-pressed={form.category === value}
                        onClick={() => updateField("category", value)}
                      >
                        <Icon />
                        <span>{label}</span>
                        {form.category === value && (
                          <FiCheckCircle className="feature-category-check" />
                        )}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="feature-field">
                  <label htmlFor="feature-problem">
                    What problem would this solve? <span>*</span>
                  </label>
                  <textarea
                    id="feature-problem"
                    rows={3}
                    maxLength={1500}
                    placeholder="Describe the current limitation or need..."
                    value={form.problem}
                    onChange={(event) =>
                      updateField("problem", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="feature-field">
                  <label htmlFor="feature-solution">
                    Proposed solution <span>*</span>
                  </label>
                  <textarea
                    id="feature-solution"
                    rows={4}
                    maxLength={2500}
                    placeholder="Explain how you imagine the feature working..."
                    value={form.solution}
                    onChange={(event) =>
                      updateField("solution", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="feature-two-column">
                  <div className="feature-field">
                    <label htmlFor="feature-beneficiaries">
                      Who would benefit?
                    </label>
                    <select
                      id="feature-beneficiaries"
                      value={form.beneficiaries}
                      onChange={(event) =>
                        updateField("beneficiaries", event.target.value)
                      }
                    >
                      <option value="everyone">Everyone</option>
                      <option value="individuals">Individuals</option>
                      <option value="communities">Communities</option>
                      <option value="analysts">Analysts</option>
                      <option value="responders">Authorized responders</option>
                      <option value="other">Other groups</option>
                    </select>
                  </div>

                  <div className="feature-field">
                    <label htmlFor="feature-priority">
                      Suggested priority
                    </label>
                    <select
                      id="feature-priority"
                      value={form.priority}
                      onChange={(event) =>
                        updateField("priority", event.target.value)
                      }
                    >
                      <option value="low">Low — nice to have</option>
                      <option value="medium">Medium — useful addition</option>
                      <option value="high">High — important need</option>
                    </select>
                  </div>
                </div>

                <div className="feature-field">
                  <label htmlFor="feature-details">
                    Additional details <span className="optional">(optional)</span>
                  </label>
                  <textarea
                    id="feature-details"
                    rows={3}
                    maxLength={2000}
                    placeholder="Examples, use cases, or anything else we should know..."
                    value={form.details}
                    onChange={(event) =>
                      updateField("details", event.target.value)
                    }
                  />
                </div>

                {(localError || submitError) && (
                  <div className="feature-error" role="alert">
                    <FiAlertCircle />
                    <span>{localError || submitError}</span>
                  </div>
                )}

                <div className="feature-review-note">
                  <FiShield />
                  <span>
                    Requests are reviewed for usefulness, feasibility, safety,
                    and alignment with G.R.O.A. Submitting an idea does not
                    guarantee implementation.
                  </span>
                </div>

                <button
                  type="submit"
                  className="feature-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Submitting request...</>
                  ) : (
                    <>
                      Submit feature request <FiSend />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeaturePopup;
