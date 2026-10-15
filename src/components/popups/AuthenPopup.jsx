
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiShield,
  FiLock,
  FiEye,
  FiDatabase,
  FiCheckCircle,
  FiLayers,
  FiActivity,
  FiArrowUpRight,
} from "react-icons/fi";
import "./PopupStyles.css";

const AuthenPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const principles = [
    {
      icon: FiLock,
      title: "Access control",
      description:
        "Access to sensitive operations should be limited to authorized users and services, with permissions appropriate to each role.",
      tag: "ACCESS",
    },
    {
      icon: FiDatabase,
      title: "Data protection",
      description:
        "Sensitive information should be handled carefully, with appropriate safeguards for storage, transmission, retention, and deletion.",
      tag: "DATA",
    },
    {
      icon: FiEye,
      title: "Traceability",
      description:
        "Security-relevant actions should be traceable through appropriate records, helping authorized reviewers investigate activity and changes.",
      tag: "AUDIT",
    },
    {
      icon: FiLayers,
      title: "Layered security",
      description:
        "Security should rely on multiple complementary safeguards rather than depending on a single control or component.",
      tag: "DEFENSE",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="authen-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.section
          className="authen-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="authen-title"
          aria-describedby="authen-description"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="authen-glow" />

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
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Authen</h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Security, protection, accountability
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

          <div className="authen-body">
            {/* Security hero */}
            <section className="authen-hero">
              <div className="authen-visual" aria-hidden="true">
                <div className="authen-ring authen-ring-outer" />
                <div className="authen-ring authen-ring-middle" />
                <div className="authen-ring authen-ring-inner" />

                <div className="authen-shield">
                  <FiShield />
                  <span className="authen-shield-check">
                    <FiCheckCircle />
                  </span>
                </div>

                <span className="authen-orbit-dot orbit-dot-one" />
                <span className="authen-orbit-dot orbit-dot-two" />
                <span className="authen-orbit-dot orbit-dot-three" />
              </div>

              <div className="authen-hero-copy">
                <span className="authen-section-label">
                  BUILT AROUND RESPONSIBILITY
                </span>

                <h3 id="authen-description">
                  Security is more than a feature.
                  <span> It's a responsibility.</span>
                </h3>

                <p>
                  G.R.O.A. handles information that can influence how people
                  understand threats and crises. Authen represents the
                  security principles that should protect the platform,
                  its information, and the people who depend on it.
                </p>

                <div className="authen-principle-chips">
                  <span>
                    <FiLock />
                    Protection
                  </span>
                  <span>
                    <FiEye />
                    Accountability
                  </span>
                  <span>
                    <FiShield />
                    Trust
                  </span>
                </div>
              </div>
            </section>

            {/* Security principles */}
            <section className="authen-section">
              <div className="authen-section-heading">
                <div>
                  <span className="authen-section-label">
                    SECURITY FRAMEWORK
                  </span>
                  <h3>Four core principles</h3>
                </div>

                <span className="authen-section-index">01 — 04</span>
              </div>

              <div className="authen-principles-grid">
                {principles.map((principle, index) => {
                  const Icon = principle.icon;

                  return (
                    <article
                      className="authen-principle-card"
                      key={principle.tag}
                    >
                      <div className="authen-principle-top">
                        <div className="authen-principle-icon">
                          <Icon />
                        </div>

                        <span className="authen-principle-number">
                          0{index + 1}
                        </span>
                      </div>

                      <span className="authen-principle-tag">
                        {principle.tag}
                      </span>

                      <h4>{principle.title}</h4>

                      <p>{principle.description}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Operational responsibility */}
            <section className="authen-operations">
              <div className="authen-operations-icon">
                <FiActivity />
              </div>

              <div className="authen-operations-copy">
                <span className="authen-section-label">
                  SECURITY IN PRACTICE
                </span>

                <h3>Trust requires ongoing attention.</h3>

                <p>
                  Security isn't established by a badge or a promise.
                  It depends on correctly configured controls, careful
                  handling of information, regular maintenance, and
                  investigation of suspicious activity.
                </p>
              </div>
            </section>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthenPopup;
