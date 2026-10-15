import { useState } from "react";
import { motion } from "framer-motion";

const GiveData = () => {
  const [reportType, setReportType] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend submission will go here.
    setSubmitted(true);
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
            Provide us with Data
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Know something G.R.O.A. doesn't? Help us build a clearer picture
            of what is happening around the world.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="give-data-layout"
        >

          {/* Information panel */}
          <motion.div variants={itemVariants} className="glass give-data-info">
            <span className="give-data-label">
              DATA NETWORK
            </span>

            <h2>
              You see something.
              <br />
              <span className="text-gradient">We investigate it.</span>
            </h2>

            <p>
              G.R.O.A. receives information from official sources,
              organizations, and people who may have information about
              an ongoing situation.
            </p>

            <div className="give-data-notice">
              <div className="give-data-notice-icon">!</div>

              <div>
                <strong>Important</strong>
                <p>
                  Information submitted here is not automatically considered
                  verified. G.R.O.A. reviews and verifies information before
                  it can become trusted data.
                </p>
              </div>
            </div>

            <div className="give-data-process">
              <div className="give-data-step">
                <span>01</span>
                <div>
                  <strong>Submit</strong>
                  <p>Tell us what you know.</p>
                </div>
              </div>

              <div className="give-data-step">
                <span>02</span>
                <div>
                  <strong>Review</strong>
                  <p>Information is investigated and assessed.</p>
                </div>
              </div>

              <div className="give-data-step">
                <span>03</span>
                <div>
                  <strong>Verify</strong>
                  <p>Reliable information can become part of G.R.O.A.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div variants={itemVariants} className="glass give-data-form-card">

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="give-data-success"
              >
                <div className="give-data-success-icon">
                  ✓
                </div>

                <h2>Information Received</h2>

                <p>
                  Thank you for providing information to G.R.O.A.
                  Your submission can now enter the review process.
                </p>

                <p className="give-data-small">
                  Remember: submission does not mean the information has
                  been verified.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setReportType("");
                  }}
                >
                  Provide More Data
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>

                <div className="give-data-form-header">
                  <span className="give-data-label">
                    DATA SUBMISSION
                  </span>

                  <h2>What do you know?</h2>

                  <p>
                    Provide as much useful information as you can.
                    You don't need to know everything.
                  </p>
                </div>

                {/* Report type */}
                <div className="form-group">
                  <label htmlFor="reportType">
                    What are you reporting?
                  </label>

                  <select
                    id="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    required
                  >
                    <option value="">
                      Select a category
                    </option>

                    <option value="event">
                      Event / Threat
                    </option>

                    <option value="alert">
                      Existing Alert
                    </option>

                    <option value="location">
                      Location Information
                    </option>

                    <option value="correction">
                      Incorrect Information
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                {/* Existing alert */}
                {reportType === "alert" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="form-group"
                  >
                    <label htmlFor="alertReference">
                      Alert / Event Reference
                    </label>

                    <input
                      id="alertReference"
                      type="text"
                      placeholder="Enter the alert or event reference"
                    />
                  </motion.div>
                )}

                {/* Location */}
                <div className="form-group">
                  <label htmlFor="location">
                    Where did this happen?
                  </label>

                  <input
                    id="location"
                    type="text"
                    placeholder="City, region, country or specific location"
                    required
                  />
                </div>

                {/* Date */}
                <div className="give-data-row">

                  <div className="form-group">
                    <label htmlFor="date">
                      When did this happen?
                    </label>

                    <input
                      id="date"
                      type="date"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="time">
                      Approx. time
                    </label>

                    <input
                      id="time"
                      type="time"
                    />
                  </div>

                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="description">
                    Tell us what you know
                  </label>

                  <textarea
                    id="description"
                    rows="7"
                    placeholder="Describe what you saw, heard, experienced, or learned..."
                    required
                  />
                </div>

                {/* Source */}
                <div className="form-group">
                  <label htmlFor="source">
                    Source or evidence
                    <span className="optional">
                      Optional
                    </span>
                  </label>

                  <input
                    id="source"
                    type="text"
                    placeholder="News source, organization, website, witness, etc."
                  />

                  <small>
                    If you have a source that can help us verify the
                    information, provide it here.
                  </small>
                </div>

                {/* Submit */}
                <div className="give-data-submit-area">

                  <p>
                    By submitting, you understand that the information
                    may be reviewed for verification.
                  </p>

                  <button
                    type="submit"
                    className="give-data-submit"
                  >
                    Submit Information
                    <span>→</span>
                  </button>

                </div>

              </form>
            )}

          </motion.div>

        </motion.div>

        {/* Bottom explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="give-data-bottom glass"
        >
          <div>
            <span className="give-data-label">
              WHY THIS MATTERS
            </span>

            <h2>
              Better information leads to better awareness.
            </h2>
          </div>

          <p>
            G.R.O.A. combines information from multiple sources to help
            people understand situations as they develop. Your submission
            may provide context, identify something missing, or help
            investigators understand an event from another perspective.
          </p>
        </motion.div>

      </div>
    </motion.div>
  )
}

export default GiveData