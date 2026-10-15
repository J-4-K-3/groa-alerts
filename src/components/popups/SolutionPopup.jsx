
import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiX,
  FiSearch,
  FiBookOpen,
  FiPlus,
  FiShield,
  FiHeart,
  FiMapPin,
  FiClock,
  FiArrowUpRight,
  FiCheckCircle,
  FiAlertTriangle,
  FiPackage,
} from "react-icons/fi";
import "./PopupStyles.css";

const categories = [
  "All categories",
  "Emergency preparedness",
  "Evacuation",
  "Communication",
  "Shelter and supplies",
  "First aid and health",
  "Power and utilities",
  "Community support",
  "Recovery",
  "Other",
];

const contributionCategories = categories.filter(
  (category) => category !== "All categories"
);

const statusLabels = {
  submitted: "Submitted",
  under_review: "Under review",
  verified: "Verified",
  needs_revision: "Needs revision",
};

const initialForm = {
  title: "",
  category: "Emergency preparedness",
  situation: "",
  solution: "",
  steps: "",
  resources: "",
  region: "",
  limitations: "",
  impact: "",
  contact: "",
};

const SolutionPopup = ({
  isOpen,
  onClose,
  solutions = [],
  onSubmitSolution,
  isSubmitting = false,
  submitError = "",
}) => {
  const [activeTab, setActiveTab] = useState("explore");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState("");

  const filteredSolutions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return solutions.filter((solution) => {
      const searchableText = [
        solution.title,
        solution.category,
        solution.situation,
        solution.solution,
        solution.region,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesCategory =
        categoryFilter === "All categories" ||
        solution.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        solution.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [solutions, search, categoryFilter, statusFilter]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setValidationError("");
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.situation.trim() ||
      !form.solution.trim() ||
      !form.steps.trim() ||
      !form.limitations.trim()
    ) {
      setValidationError(
        "Complete the required fields, including the solution's limitations."
      );
      return;
    }

    if (!onSubmitSolution) {
      setValidationError(
        "Solution submission is not connected yet."
      );
      return;
    }

    try {
      await onSubmitSolution({
        ...form,
        title: form.title.trim(),
        situation: form.situation.trim(),
        solution: form.solution.trim(),
        steps: form.steps.trim(),
        resources: form.resources.trim(),
        region: form.region.trim(),
        limitations: form.limitations.trim(),
        impact: form.impact.trim(),
        contact: form.contact.trim(),
        submittedAt: new Date().toISOString(),
      });

      setForm(initialForm);
      setActiveTab("explore");
      setValidationError("");
    } catch {
      // Keep the form available if the submission fails.
      // Pass the actual backend error through submitError.
    }
  };

  const getStatusLabel = (status) =>
    statusLabels[status] || "Status unavailable";

  const formatDate = (date) => {
    if (!date) return null;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return null;

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="solution-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.section
          className="solution-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="solution-title"
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
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Solution Inventory</h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Share practical ideas that may help others prepare,
                  respond, and recover
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

          <div className="solution-body">
            <div className="solution-hero">
              <div className="solution-hero-copy">
                <span className="solution-hero-label">
                  KNOWLEDGE CAN MAKE A DIFFERENCE
                </span>
                <h3>
                  One practical idea could help someone prepare.
                </h3>
                <p>
                  Discover community contributions or share an approach
                  that could help others facing a similar situation.
                </p>

                <div className="solution-hero-actions">
                  <button
                    type="button"
                    className={`solution-primary-action ${activeTab === "explore" ? "active" : ""
                      }`}
                    onClick={() => {
                      setActiveTab("explore");
                      setSelectedSolution(null);
                    }}
                  >
                    <FiBookOpen />
                    Explore Solutions
                  </button>

                  <button
                    type="button"
                    className={`solution-secondary-action ${activeTab === "contribute" ? "active" : ""
                      }`}
                    onClick={() => {
                      setActiveTab("contribute");
                      setSelectedSolution(null);
                    }}
                  >
                    <FiPlus />
                    Contribute
                  </button>
                </div>
              </div>

              <div className="solution-hero-art" aria-hidden="true">
                <div className="solution-orbit solution-orbit-one" />
                <div className="solution-orbit solution-orbit-two" />
                <div className="solution-art-center">
                  <FiHeart />
                </div>
                <span className="solution-art-node node-one">
                  <FiShield />
                </span>
                <span className="solution-art-node node-two">
                  <FiBookOpen />
                </span>
                <span className="solution-art-node node-three">
                  <FiCheckCircle />
                </span>
              </div>
            </div>

            <div className="solution-safety-note">
              <FiShield />
              <p>
                <strong>Community ideas, clearly identified.</strong>{" "}
                Contributions are not automatically verified. Always
                consider local conditions and seek qualified emergency
                assistance when necessary.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "explore" && !selectedSolution && (
                <motion.div
                  key="explore"
                  className="solution-explore"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <div className="solution-section-heading">
                    <div>
                      <h3>Explore the inventory</h3>
                      <p>
                        Browse submitted contributions and their review status.
                      </p>
                    </div>
                    <span className="solution-result-count">
                      {filteredSolutions.length}{" "}
                      {filteredSolutions.length === 1
                        ? "result"
                        : "results"}
                    </span>
                  </div>

                  <div className="solution-filters">
                    <div className="solution-search">
                      <FiSearch />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search solutions, situations, regions..."
                        aria-label="Search solutions"
                      />
                    </div>

                    <select
                      value={categoryFilter}
                      onChange={(event) =>
                        setCategoryFilter(event.target.value)
                      }
                      aria-label="Filter by category"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      aria-label="Filter by review status"
                    >
                      <option value="all">All statuses</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under review</option>
                      <option value="verified">Verified</option>
                      <option value="needs_revision">Needs revision</option>
                    </select>
                  </div>

                  {filteredSolutions.length > 0 ? (
                    <div className="solution-card-grid">
                      {filteredSolutions.map((solution) => (
                        <article
                          className="solution-card"
                          key={solution.id}
                        >
                          <div className="solution-card-top">
                            <span className="solution-category">
                              {solution.category || "Uncategorized"}
                            </span>
                            <span
                              className={`solution-status status-${solution.status || "unknown"}`}
                            >
                              {getStatusLabel(solution.status)}
                            </span>
                          </div>

                          <h4>{solution.title}</h4>

                          <p className="solution-card-situation">
                            {solution.situation ||
                              "No situation description provided."}
                          </p>

                          {solution.region && (
                            <div className="solution-card-meta">
                              <FiMapPin />
                              <span>{solution.region}</span>
                            </div>
                          )}

                          {formatDate(solution.submittedAt) && (
                            <div className="solution-card-meta">
                              <FiClock />
                              <span>
                                Submitted{" "}
                                {formatDate(solution.submittedAt)}
                              </span>
                            </div>
                          )}

                          <button
                            type="button"
                            className="solution-view-button"
                            onClick={() => setSelectedSolution(solution)}
                          >
                            View contribution <FiArrowUpRight />
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="solution-empty-state">
                      <div className="solution-empty-icon">
                        <FiPackage />
                      </div>
                      <h4>No matching solutions yet</h4>
                      <p>
                        Try a different search or category, or contribute
                        an idea that could help someone else.
                      </p>
                      <button
                        type="button"
                        className="solution-primary-action active"
                        onClick={() => setActiveTab("contribute")}
                      >
                        <FiPlus />
                        Contribute a Solution
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "explore" && selectedSolution && (
                <motion.div
                  key="details"
                  className="solution-detail"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <button
                    type="button"
                    className="solution-back-button"
                    onClick={() => setSelectedSolution(null)}
                  >
                    ← Back to inventory
                  </button>

                  <div className="solution-detail-heading">
                    <div>
                      <span className="solution-category">
                        {selectedSolution.category || "Uncategorized"}
                      </span>
                      <h3>{selectedSolution.title}</h3>
                    </div>
                    <span
                      className={`solution-status status-${selectedSolution.status || "unknown"}`}
                    >
                      {getStatusLabel(selectedSolution.status)}
                    </span>
                  </div>

                  <div className="solution-detail-block">
                    <h4>The situation</h4>
                    <p>{selectedSolution.situation || "Not provided."}</p>
                  </div>

                  <div className="solution-detail-block">
                    <h4>Proposed solution</h4>
                    <p>{selectedSolution.solution || "Not provided."}</p>
                  </div>

                  <div className="solution-detail-block">
                    <h4>Steps to follow</h4>
                    <p className="solution-preserve-lines">
                      {selectedSolution.steps || "Not provided."}
                    </p>
                  </div>

                  {selectedSolution.resources && (
                    <div className="solution-detail-block">
                      <h4>Resources required</h4>
                      <p className="solution-preserve-lines">
                        {selectedSolution.resources}
                      </p>
                    </div>
                  )}

                  <div className="solution-detail-block solution-limitations">
                    <FiAlertTriangle />
                    <div>
                      <h4>Limitations and risks</h4>
                      <p>
                        {selectedSolution.limitations ||
                          "Limitations have not been documented."}
                      </p>
                    </div>
                  </div>

                  {selectedSolution.impact && (
                    <div className="solution-detail-block">
                      <h4>Expected impact</h4>
                      <p>{selectedSolution.impact}</p>
                    </div>
                  )}

                  {selectedSolution.region && (
                    <div className="solution-card-meta">
                      <FiMapPin />
                      <span>{selectedSolution.region}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "contribute" && (
                <motion.form
                  key="contribute"
                  className="solution-contribution-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <div className="solution-section-heading">
                    <div>
                      <h3>Contribute a solution</h3>
                      <p>
                        Describe an approach that may help others in a
                        similar situation.
                      </p>
                    </div>
                  </div>

                  <div className="solution-form-notice">
                    <FiAlertTriangle />
                    <p>
                      Be clear about what you know, what you have personally
                      tested, and what remains uncertain. Do not include
                      private information about other people.
                    </p>
                  </div>

                  <div className="solution-form-grid">
                    <div className="solution-field solution-field-full">
                      <label htmlFor="solution-title-input">
                        Solution title <span>*</span>
                      </label>
                      <input
                        id="solution-title-input"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="Give your contribution a clear title"
                        maxLength={160}
                        required
                      />
                    </div>

                    <div className="solution-field">
                      <label htmlFor="solution-category-input">
                        Category <span>*</span>
                      </label>
                      <select
                        id="solution-category-input"
                        value={form.category}
                        onChange={(e) =>
                          updateField("category", e.target.value)
                        }
                        required
                      >
                        {contributionCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="solution-field">
                      <label htmlFor="solution-region-input">
                        Region or context
                      </label>
                      <input
                        id="solution-region-input"
                        value={form.region}
                        onChange={(e) => updateField("region", e.target.value)}
                        placeholder="Where could this apply?"
                        maxLength={200}
                      />
                    </div>

                    <div className="solution-field solution-field-full">
                      <label htmlFor="solution-situation-input">
                        Situation or problem <span>*</span>
                      </label>
                      <textarea
                        id="solution-situation-input"
                        value={form.situation}
                        onChange={(e) =>
                          updateField("situation", e.target.value)
                        }
                        placeholder="What problem does this approach address?"
                        rows={3}
                        maxLength={3000}
                        required
                      />
                    </div>

                    <div className="solution-field solution-field-full">
                      <label htmlFor="solution-description-input">
                        Proposed solution <span>*</span>
                      </label>
                      <textarea
                        id="solution-description-input"
                        value={form.solution}
                        onChange={(e) =>
                          updateField("solution", e.target.value)
                        }
                        placeholder="Explain the idea and why it may help."
                        rows={4}
                        maxLength={5000}
                        required
                      />
                    </div>

                    <div className="solution-field solution-field-full">
                      <label htmlFor="solution-steps-input">
                        Practical steps <span>*</span>
                      </label>
                      <textarea
                        id="solution-steps-input"
                        value={form.steps}
                        onChange={(e) => updateField("steps", e.target.value)}
                        placeholder={"1. First step\n2. Next step\n3. What to do afterwards"}
                        rows={4}
                        maxLength={5000}
                        required
                      />
                    </div>

                    <div className="solution-field solution-field-full">
                      <label htmlFor="solution-resources-input">
                        Resources required{" "}
                        <span className="solution-optional">(optional)</span>
                      </label>
                      <textarea
                        id="solution-resources-input"
                        value={form.resources}
                        onChange={(e) =>
                          updateField("resources", e.target.value)
                        }
                        placeholder="Materials, equipment, skills, or support needed."
                        rows={2}
                        maxLength={3000}
                      />
                    </div>

                    <div className="solution-field solution-field-full">
                      <label htmlFor="solution-limitations-input">
                        Limitations, risks, and when NOT to use it <span>*</span>
                      </label>
                      <textarea
                        id="solution-limitations-input"
                        value={form.limitations}
                        onChange={(e) =>
                          updateField("limitations", e.target.value)
                        }
                        placeholder="What could go wrong? What conditions could make this approach unsuitable?"
                        rows={3}
                        maxLength={3000}
                        required
                      />
                    </div>

                    <div className="solution-field solution-field-full">
                      <label htmlFor="solution-impact-input">
                        Expected benefit{" "}
                        <span className="solution-optional">(optional)</span>
                      </label>
                      <textarea
                        id="solution-impact-input"
                        value={form.impact}
                        onChange={(e) => updateField("impact", e.target.value)}
                        placeholder="Who might benefit, and how?"
                        rows={2}
                        maxLength={2000}
                      />
                    </div>

                    <div className="solution-field solution-field-full">
                      <label htmlFor="solution-contact-input">
                        Contact information{" "}
                        <span className="solution-optional">(optional)</span>
                      </label>
                      <input
                        id="solution-contact-input"
                        value={form.contact}
                        onChange={(e) =>
                          updateField("contact", e.target.value)
                        }
                        placeholder="If you'd like the review team to follow up"
                        maxLength={320}
                      />
                    </div>
                  </div>

                  <div className="solution-review-note">
                    <FiShield />
                    <p>
                      New contributions begin as <strong>submitted</strong>.
                      They must not be presented as verified guidance until
                      the appropriate review has been completed.
                    </p>
                  </div>

                  {(validationError || submitError) && (
                    <div className="solution-error" role="alert">
                      {validationError || submitError}
                    </div>
                  )}

                  <div className="solution-form-footer">
                    <span>
                      <span>*</span> Required fields
                    </span>
                    <div>
                      <button
                        type="button"
                        className="solution-cancel-button"
                        onClick={() => setActiveTab("explore")}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="solution-submit-button"
                        disabled={isSubmitting || !onSubmitSolution}
                      >
                        {isSubmitting ? "Submitting..." : (
                          <>
                            <FiPlus />
                            Submit Solution
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default SolutionPopup;
