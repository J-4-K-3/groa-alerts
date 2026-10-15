
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiThumbsUp,
  FiExternalLink,
  FiShield,
  FiUsers,
  FiCheckCircle,
  FiArrowUpRight,
} from "react-icons/fi";
import "./PopupStyles.css";

const UpvotePopup = ({
  isOpen,
  onClose,
  onVote,
  voteCount = 0,
  hasVoted = false,
  isVoting = false,
  trustpilotUrl = "",
}) => {
  if (!isOpen) return null;

  const formattedVotes = new Intl.NumberFormat().format(voteCount);

  return (
    <AnimatePresence>
      <motion.div
        className="upvote-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.section
          className="upvote-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upvote-title"
          aria-describedby="upvote-description"
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="upvote-glow" />

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
                <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Platform Upvote</h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  Your support helps us grow
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

          {/* Scrollable content */}
          <div className="upvote-body">
            {/* Hero */}
            <section className="upvote-hero">
              <div className="upvote-hero-art" aria-hidden="true">
                <div className="upvote-orbit orbit-one" />
                <div className="upvote-orbit orbit-two" />

                <div className="upvote-hero-icon">
                  {hasVoted ? <FiCheckCircle /> : <FiThumbsUp />}
                </div>
              </div>

              <div className="upvote-hero-copy">
                <span className="upvote-kicker">
                  {hasVoted ? "THANK YOU FOR YOUR SUPPORT" : "MAKE YOUR VOICE COUNT"}
                </span>

                <h3>
                  {hasVoted
                    ? "You're part of the movement."
                    : "Support a mission that matters."}
                </h3>

                <p>
                  G.R.O.A. works to improve threat awareness, intelligence,
                  and crisis response. An upvote is your way of showing
                  support for the platform and the work behind it.
                </p>
              </div>

              <div className="upvote-counter">
                <div className="upvote-counter-icon">
                  <FiUsers />
                </div>

                <div>
                  <span className="upvote-counter-value">
                    {formattedVotes}
                  </span>
                  <span className="upvote-counter-label">
                    {voteCount === 1 ? "Community vote" : "Community votes"}
                  </span>
                </div>

                {/*<FiArrowUpRight className="upvote-counter-arrow" />*/}
              </div>
            </section>

            {/* Voting actions */}
            <section className="upvote-action-grid">
              <article className="upvote-action-card primary-card">
                <div className="upvote-card-top">
                  <div className="upvote-card-icon blue-icon">
                    <FiThumbsUp />
                  </div>

                  <span className="upvote-card-tag">G.R.O.A.</span>
                </div>

                <h3>Upvote the platform</h3>

                <p>
                  Show your support directly within G.R.O.A. and contribute
                  to its community vote count.
                </p>

                <button
                  type="button"
                  className={`upvote-button ${hasVoted ? "voted" : ""}`}
                  onClick={onVote}
                  disabled={hasVoted || isVoting || !onVote}
                >
                  {hasVoted ? (
                    <>
                      <FiCheckCircle />
                      Vote recorded
                    </>
                  ) : isVoting ? (
                    <>
                      <span className="upvote-spinner" />
                      Recording vote...
                    </>
                  ) : (
                    <>
                      <FiThumbsUp />
                      Cast your vote
                    </>
                  )}
                </button>

                <span className="upvote-card-footnote">
                  {hasVoted
                    ? "Thank you for supporting G.R.O.A."
                    : "One vote per person, subject to your voting rules."}
                </span>
              </article>

              <article className="upvote-action-card trustpilot-card">
                <div className="upvote-card-top">
                  <div className="upvote-card-icon trustpilot-icon">
                    <span>★</span>
                  </div>

                  <span className="upvote-card-tag external-tag">
                    EXTERNAL REVIEW
                  </span>
                </div>

                <h3>Share your experience</h3>

                <p>
                  Want to say more? Visit Trustpilot to share your honest
                  experience with G.R.O.A.
                </p>

                {trustpilotUrl ? (
                  <a
                    className="upvote-button trustpilot-button"
                    href={trustpilotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Review on Trustpilot
                    <FiExternalLink />
                  </a>
                ) : (
                  <div className="upvote-link-placeholder">
                    <FiExternalLink />
                    Trustpilot link coming soon
                  </div>
                )}

                <span className="upvote-card-footnote">
                  Reviews are submitted separately on Trustpilot.
                </span>
              </article>
            </section>

            {/* Trust and transparency */}
            <section className="upvote-transparency">
              <div className="upvote-transparency-icon">
                <FiShield />
              </div>

              <div>
                <h4>Support built on transparency</h4>
                <p>
                  An upvote represents community support, not a verification
                  of every report or assessment published through G.R.O.A.
                  Honest feedback helps the platform improve.
                </p>
              </div>
            </section>

            <footer className="upvote-footer">
              <span>
                <span className="footer-dot" />
                G.R.O.A. · Community
              </span>

              <span>Your voice. Your choice.</span>
            </footer>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpvotePopup;
