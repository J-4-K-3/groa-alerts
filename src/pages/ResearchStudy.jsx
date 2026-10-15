import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiBookOpen,
  FiCheckCircle,
  FiCircle,
  FiArrowRight,
  FiPlus,
  FiDownload,
  FiFileText,
  FiMessageCircle,
  FiRefreshCw,
  FiExternalLink,
} from "react-icons/fi";

const Research = () => {
  const [researchState, setResearchState] = useState("question");
  const [question, setQuestion] = useState("");
  const [activeStarter, setActiveStarter] = useState(null);

  const [study, setStudy] = useState({
    title: "How is climate change affecting agriculture?",
    overview:
      "This study examines the relationship between climate change and agricultural productivity, focusing on changing weather patterns, water availability, soil conditions, and the ability of farmers to adapt.",
    findings: [
      "Changing rainfall patterns are increasing uncertainty for farmers.",
      "Higher temperatures can reduce crop productivity in vulnerable regions.",
      "Water availability is becoming an increasingly important agricultural constraint.",
      "Adaptation strategies can significantly reduce some climate-related risks.",
    ],
    evidence: [
      {
        title: "Changing rainfall patterns",
        description:
          "Long-term changes in rainfall timing and intensity can affect planting seasons and crop yields.",
      },
      {
        title: "Temperature increases",
        description:
          "Higher temperatures can create heat stress for crops and livestock while increasing water demand.",
      },
      {
        title: "Adaptation",
        description:
          "Improved irrigation, crop diversification, and climate-resilient farming practices can reduce vulnerability.",
      },
    ],
    analysis:
      "The evidence suggests that climate change is not affecting agriculture through a single mechanism. Instead, temperature, rainfall, water availability, and extreme weather interact with local farming conditions. The impact therefore varies significantly between regions.",
    sources: [
      {
        name: "NASA Climate",
        description: "Climate science and observations",
      },
      {
        name: "FAO",
        description: "Agriculture and food systems research",
      },
      {
        name: "IPCC",
        description: "Global climate assessment",
      },
    ],
  });

  const researchStarters = [
    "Global issues",
    "Science",
    "Society",
    "Climate",
    "Open question",
  ];

  const researchSteps = [
    "Understanding question",
    "Searching relevant information",
    "Ranking sources",
    "Cross-checking sources",
    "Verifying findings",
    "Building study",
  ];

  const beginResearch = () => {
    if (!question.trim()) return;

    setResearchState("researching");

    // Prototype simulation.
    // Later this can be replaced with real Telvin/G.R.O.A. events.
    setTimeout(() => {
      setStudy((previous) => ({
        ...previous,
        title: question,
        overview:
          "G.R.O.A. has completed an initial investigation into your question. The study combines relevant information, compares evidence, and identifies the most important findings.",
      }));

      setResearchState("complete");
    }, 4500);
  };

  const continueResearch = () => {
    setResearchState("question");
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingTop: "140px", paddingBottom: "40px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <motion.div
          variants={itemVariants}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <h1
            className="text-gradient"
            style={{ fontSize: "2.5rem", marginBottom: "1rem" }}
          >
            Research Study
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Ask G.R.O.A. a question worth investigating. We’ll research it,
            examine the evidence and build a study you can continue exploring.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* =========================================================
 STATE 1 — QUESTION
 ========================================================= */}
          {researchState === "question" && (
            <motion.div
              key="question"
              className="research-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="research-intro-card">
                <div className="research-intro-icon">
                  <FiBookOpen />
                </div>

                <div>
                  <span className="research-eyebrow">
                    START A RESEARCH STUDY
                  </span>

                  <h2>Where should we begin?</h2>

                  <p>
                    Your question can be simple, complicated, specific, or
                    completely open-ended. Give G.R.O.A. something worth
                    investigating.
                  </p>
                </div>
              </div>

              <div className="research-workspace">
                <div className="research-workspace-header">
                  <div>
                    <span className="research-label">RESEARCH QUESTION</span>
                    <h3>What would you like G.R.O.A. to investigate?</h3>
                  </div>

                  <FiSearch className="research-header-icon" />
                </div>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything you want G.R.O.A. to investigate..."
                  className="research-textarea"
                />

                <div className="research-workspace-footer">
                  <span>
                    {question.length > 0
                      ? `${question.length} characters`
                      : "Write your question naturally"}
                  </span>

                  <button
                    className="research-primary-button"
                    onClick={beginResearch}
                    disabled={!question.trim()}
                  >
                    Begin Research
                    <FiArrowRight />
                  </button>
                </div>
              </div>

              <div className="research-starters">
                <span className="research-label">RESEARCH STARTERS</span>

                <div className="research-starter-grid">
                  {researchStarters.map((starter, index) => (
                    <button
                      key={starter}
                      className={`research-starter ${activeStarter === index ? "active" : ""
                        }`}
                      onClick={() => {
                        setActiveStarter(index);
                        setQuestion(
                          `What should we understand about ${starter.toLowerCase()}?`
                        );
                      }}
                    >
                      <FiPlus />
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================
 STATE 2 — RESEARCHING
 ========================================================= */}
          {researchState === "researching" && (
            <motion.div
              key="researching"
              className="research-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="researching-card">
                <div className="researching-top">
                  <div className="research-orb">
                    <FiSearch />
                  </div>

                  <div>
                    <span className="research-eyebrow">
                      G.R.O.A. IS INVESTIGATING
                    </span>

                    <h2>{question}</h2>

                    <p>
                      Gathering information, evaluating evidence, and building
                      your research study.
                    </p>
                  </div>
                </div>

                <div className="research-progress">
                  <div className="research-progress-line" />

                  {researchSteps.map((step, index) => (
                    <motion.div
                      key={step}
                      className={`research-progress-step ${index < 5 ? "completed" : "active"
                        }`}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: index * 0.6,
                      }}
                    >
                      <div className="research-progress-icon">
                        {index < 5 ? <FiCheckCircle /> : <FiCircle />}
                      </div>

                      <span>{step}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="researching-status">
                  <motion.div
                    className="research-pulse"
                    animate={{
                      scale: [1, 1.25, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />

                  <span>Verifying findings...</span>
                  <span>Verifying findings...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================
 STATE 3 — COMPLETE
 ========================================================= */}
          {researchState === "complete" && (
            <motion.div
              key="complete"
              className="research-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="study-complete-banner">
                <div className="study-complete-icon">
                  <FiCheckCircle />
                </div>

                <div>
                  <span className="research-eyebrow">
                    RESEARCH STUDY COMPLETE
                  </span>
                  <h2>{study.title}</h2>
                  <p>
                    Initial investigation completed. You can continue
                    researching this study at any time.
                  </p>
                </div>
              </div>

              <div className="study-layout">
                <main className="study-content">
                  <section className="study-section">
                    <span className="research-label">OVERVIEW</span>
                    <p className="study-overview">{study.overview}</p>
                  </section>

                  <section className="study-section">
                    <div className="study-section-heading">
                      <span className="research-label">KEY FINDINGS</span>
                      <span className="study-count">
                        {study.findings.length} findings
                      </span>
                    </div>

                    <div className="findings-list">
                      {study.findings.map((finding, index) => (
                        <motion.div
                          key={finding}
                          className="finding-item"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 }}
                        >
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <p>{finding}</p>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  <section className="study-section">
                    <span className="research-label">EVIDENCE</span>

                    <div className="evidence-grid">
                      {study.evidence.map((item) => (
                        <div className="evidence-card" key={item.title}>
                          <div className="evidence-card-icon">
                            <FiFileText />
                          </div>

                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="study-section">
                    <span className="research-label">ANALYSIS</span>

                    <div className="analysis-card">
                      <FiMessageCircle />
                      <p>{study.analysis}</p>
                    </div>
                  </section>

                  <section className="study-section">
                    <span className="research-label">SOURCES</span>

                    <div className="sources-list">
                      {study.sources.map((source) => (
                        <div className="source-item" key={source.name}>
                          <div>
                            <h3>{source.name}</h3>
                            <p>{source.description}</p>
                          </div>

                          <FiExternalLink />
                        </div>
                      ))}
                    </div>
                  </section>
                </main>

                <aside className="study-actions">
                  <div className="study-actions-card">
                    <span className="research-label">STUDY ACTIONS</span>

                    <button
                      className="study-action primary"
                      onClick={continueResearch}
                    >
                      <FiRefreshCw />
                      Continue Research
                    </button>

                    <button className="study-action">
                      <FiFileText />
                      Create Documentation
                    </button>

                    <button className="study-action">
                      <FiDownload />
                      Export Study
                    </button>
                  </div>

                  <div className="study-followup-card">
                    <FiMessageCircle />

                    <h3>Keep investigating</h3>

                    <p>
                      Research doesn't have to end here. Ask a follow-up
                      question and G.R.O.A. will continue from the evidence
                      already collected.
                    </p>
                  </div>
                </aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default Research