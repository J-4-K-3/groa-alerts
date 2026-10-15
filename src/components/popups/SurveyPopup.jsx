
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiCheckCircle, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import "./PopupStyles.css";

const initialAnswers = {
  usage: "",
  easeOfUse: "",
  usefulFeatures: [],
  informationClarity: "",
  missingFeatures: "",
  improvements: "",
  additionalComments: "",
};

const featureOptions = [
  "Alerts and threat information",
  "Interactive maps",
  "Crisis updates and timelines",
  "News and information sources",
  "Regional information",
  "Safety guidance",
  "Other features",
];

const SurveyPopup = ({
  isOpen,
  onClose,
  onSubmitSurvey,
  isSubmitting = false,
  submitError = "",
}) => {
  const [answers, setAnswers] = useState(initialAnswers);
  const [validationError, setValidationError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const updateAnswer = (field, value) => {
    setAnswers((current) => ({ ...current, [field]: value }));
    setValidationError("");
  };

  const toggleFeature = (feature) => {
    setAnswers((current) => ({
      ...current,
      usefulFeatures: current.usefulFeatures.includes(feature)
        ? current.usefulFeatures.filter((item) => item !== feature)
        : [...current.usefulFeatures, feature],
    }));
    setValidationError("");
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!answers.usage || !answers.easeOfUse || !answers.informationClarity) {
      setValidationError(
        "Please answer the three required questions before submitting."
      );
      return;
    }

    if (!onSubmitSurvey) {
      setValidationError("Survey submission is not configured yet.");
      return;
    }

    try {
      await onSubmitSurvey({
        ...answers,
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch {
      // Keep the answers available if submission fails.
      // Pass the backend error through submitError.
    }
  };

  const resetSurvey = () => {
    setAnswers(initialAnswers);
    setValidationError("");
    setSubmitted(false);
  };

  const answeredRequired = [
    answers.usage,
    answers.easeOfUse,
    answers.informationClarity,
  ].filter(Boolean).length;

  return (
    <AnimatePresence>
      <motion.div
        className="survey-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.section
          className="survey-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="survey-title"
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
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Platform Survey</h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  A few questions to help us understand your experience
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

          {submitted ? (
            <div className="survey-success">
              <div className="survey-success-icon">
                <FiCheckCircle />
              </div>
              <span className="survey-eyebrow">RESPONSE RECEIVED</span>
              <h3>Thank you for your feedback.</h3>
              <p>
                Your answers can help guide future improvements to G.R.O.A
              </p>
              <button
                type="button"
                className="survey-submit"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
          ) : (
            <form className="survey-form" onSubmit={handleSubmit}>
              <div className="survey-intro">
                <div>
                  <span className="survey-intro-label">YOUR VOICE MATTERS</span>
                  <h3>Help us make G.R.O.A better.</h3>
                  <p>
                    Answer a few short questions about your experience.
                    There are no right or wrong answers.
                  </p>
                </div>
                <div className="survey-progress">
                  <strong>{answeredRequired}/3</strong>
                  <span>required questions</span>
                </div>
              </div>

              <p className="survey-required-note">
                Questions marked <span>*</span> are required. Other questions
                are optional.
              </p>

              <section className="survey-question">
                <div className="survey-question-heading">
                  <span>01</span>
                  <label>
                    How often do you use G.R.O.A.? <span>*</span>
                  </label>
                </div>

                <div className="survey-option-list">
                  {[
                    "Daily",
                    "Several times a week",
                    "About once a week",
                    "Occasionally",
                    "This is my first time",
                  ].map((option) => (
                    <label className="survey-option" key={option}>
                      <input
                        type="radio"
                        name="usage"
                        value={option}
                        checked={answers.usage === option}
                        onChange={() => updateAnswer("usage", option)}
                        required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="survey-question">
                <div className="survey-question-heading">
                  <span>02</span>
                  <label>
                    How easy is G.R.O.A. to use? <span>*</span>
                  </label>
                </div>

                <div className="survey-rating">
                  {[
                    { value: "1", label: "Very difficult" },
                    { value: "2", label: "Difficult" },
                    { value: "3", label: "Okay" },
                    { value: "4", label: "Easy" },
                    { value: "5", label: "Very easy" },
                  ].map((rating) => (
                    <button
                      type="button"
                      key={rating.value}
                      className={`survey-rating-button ${answers.easeOfUse === rating.value ? "selected" : ""
                        }`}
                      aria-pressed={answers.easeOfUse === rating.value}
                      onClick={() => updateAnswer("easeOfUse", rating.value)}
                    >
                      <strong>{rating.value}</strong>
                      <span>{rating.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="survey-question">
                <div className="survey-question-heading">
                  <span>03</span>
                  <label>Which parts of G.R.O.A. do you find most useful?</label>
                </div>
                <p className="survey-question-hint">
                  Select all that apply.
                </p>

                <div className="survey-feature-grid">
                  {featureOptions.map((feature) => (
                    <label className="survey-option" key={feature}>
                      <input
                        type="checkbox"
                        checked={answers.usefulFeatures.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                      />
                      <span>{feature}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="survey-question">
                <div className="survey-question-heading">
                  <span>04</span>
                  <label>
                    How clear and understandable is the information? <span>*</span>
                  </label>
                </div>

                <div className="survey-option-list">
                  {[
                    "Very clear",
                    "Mostly clear",
                    "Sometimes confusing",
                    "Often confusing",
                    "Not sure",
                  ].map((option) => (
                    <label className="survey-option" key={option}>
                      <input
                        type="radio"
                        name="informationClarity"
                        value={option}
                        checked={answers.informationClarity === option}
                        onChange={() =>
                          updateAnswer("informationClarity", option)
                        }
                        required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="survey-question">
                <div className="survey-question-heading">
                  <span>05</span>
                  <label htmlFor="survey-missing">
                    What features or information would you like to see added?
                  </label>
                </div>
                <textarea
                  id="survey-missing"
                  value={answers.missingFeatures}
                  onChange={(event) =>
                    updateAnswer("missingFeatures", event.target.value)
                  }
                  placeholder="Tell us what's missing for you..."
                  rows={3}
                  maxLength={2000}
                />
              </section>

              <section className="survey-question">
                <div className="survey-question-heading">
                  <span>06</span>
                  <label htmlFor="survey-improvements">
                    What is one thing we could improve?
                  </label>
                </div>
                <textarea
                  id="survey-improvements"
                  value={answers.improvements}
                  onChange={(event) =>
                    updateAnswer("improvements", event.target.value)
                  }
                  placeholder="A feature, design choice, or part of the experience..."
                  rows={3}
                  maxLength={2000}
                />
              </section>

              <section className="survey-question">
                <div className="survey-question-heading">
                  <span>07</span>
                  <label htmlFor="survey-comments">
                    Anything else you'd like us to know?
                  </label>
                </div>
                <textarea
                  id="survey-comments"
                  value={answers.additionalComments}
                  onChange={(event) =>
                    updateAnswer("additionalComments", event.target.value)
                  }
                  placeholder="Additional thoughts or suggestions..."
                  rows={3}
                  maxLength={2000}
                />
              </section>

              <div className="survey-privacy-note">
                <FiCheckCircle />
                <p>
                  Please avoid including passwords, personal identification
                  numbers, or sensitive information about yourself or others.
                </p>
              </div>

              {(validationError || submitError) && (
                <div className="survey-error" role="alert">
                  {validationError || submitError}
                </div>
              )}

              <footer className="survey-footer">
                <span>Thank you for helping G.R.O.A. improve.</span>
                <div>
                  <button
                    type="button"
                    className="survey-reset"
                    onClick={resetSurvey}
                    disabled={isSubmitting}
                  >
                    Clear answers
                  </button>
                  <button
                    type="submit"
                    className="survey-submit"
                    disabled={isSubmitting || !onSubmitSurvey}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Survey"}
                    {!isSubmitting && <FiArrowRight />}
                  </button>
                </div>
              </footer>
            </form>
          )}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default SurveyPopup;
