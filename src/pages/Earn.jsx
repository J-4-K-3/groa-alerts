import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCloud,
  FiTool,
  FiMapPin,
  FiGlobe,
  FiFileText,
  FiActivity,
  FiCheckCircle,
  FiArrowRight,
  FiSend,
  FiAlignCenter,
  FiUser,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiChevronDown,
} from "react-icons/fi";

const Earn = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showInsightForm, setShowInsightForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    information: "",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  const categories = [
    {
      id: "all",
      label: "All",
      icon: <FiGlobe />,
    },
    {
      id: "climate",
      label: "Climate",
      icon: <FiCloud />,
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      icon: <FiTool />,
    },
    {
      id: "local",
      label: "Local",
      icon: <FiMapPin />,
    },
    {
      id: "environment",
      label: "Environment",
      icon: <FiGlobe />,
    },
    {
      id: "events",
      label: "Events",
      icon: <FiFileText />,
    },
    {
      id: "research",
      label: "Research",
      icon: <FiActivity />,
    },
  ];

  const opportunities = [
    {
      id: 1,
      category: "climate",
      icon: <FiCloud />,
      title: "Climate Observation",
      description:
        "G.R.O.A. is looking for recent observations about weather and climate conditions in your area.",
    },
    {
      id: 2,
      category: "infrastructure",
      icon: <FiTool />,
      title: "Infrastructure Conditions",
      description:
        "Help G.R.O.A. understand the current condition of roads, public infrastructure, and other important facilities.",
    },
    {
      id: 3,
      category: "local",
      icon: <FiMapPin />,
      title: "Local Conditions",
      description:
        "Share useful information about conditions or situations currently affecting your local area.",
    },
    {
      id: 4,
      category: "environment",
      icon: <FiGlobe />,
      title: "Environmental Observation",
      description:
        "G.R.O.A. is interested in observations that can help improve understanding of environmental conditions.",
    },
    {
      id: 5,
      category: "events",
      icon: <FiFileText />,
      title: "Event Information",
      description:
        "Provide firsthand information about events or developments that may be relevant to G.R.O.A.",
    },
    {
      id: 6,
      category: "research",
      icon: <FiActivity />,
      title: "Research Contribution",
      description:
        "Contribute information that can support an ongoing G.R.O.A. research or analysis project.",
    },
  ];

  const filteredOpportunities =
    selectedCategory === "all"
      ? opportunities
      : opportunities.filter(
        (opportunity) => opportunity.category === selectedCategory
      );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("G.R.O.A. contribution:", {
      opportunity: selectedOpportunity,
      ...formData,
    });

    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setSelectedOpportunity(null);
    setShowInsightForm(false);

    setFormData({
      name: "",
      email: "",
      phone: "",
      information: "",
    });
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
            Earn with G.R.O.A
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Help G.R.O.A understand the world through information you provide
          </p>
        </motion.div>

        {/* What G.R.O.A. Needs */}
        <motion.section
          className="earn-section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="earn-section-heading"
            variants={itemVariants}
          >
            <div>
              <span className="earn-eyebrow">CONTRIBUTE</span>
              <h2>What G.R.O.A. Needs</h2>
              <p>
                Explore the types of information G.R.O.A. is currently looking
                for.
              </p>
            </div>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            className="earn-category-bar glass"
            variants={itemVariants}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`earn-category ${selectedCategory === category.id ? "active" : ""
                  }`}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSelectedOpportunity(null);
                }}
              >
                <span>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </motion.div>

          {/* Opportunity Grid */}
          <motion.div
            className="earn-opportunity-grid"
            variants={containerVariants}
          >
            {filteredOpportunities.map((opportunity) => (
              <motion.button
                key={opportunity.id}
                type="button"
                className={`earn-opportunity glass ${selectedOpportunity?.id === opportunity.id ? "selected" : ""
                  }`}
                variants={itemVariants}
                onClick={() => {
                  setSelectedOpportunity(opportunity);
                  setShowInsightForm(false);
                  setSubmitted(false);
                }}
              >
                <div className="earn-opportunity-top">
                  <div className="earn-opportunity-icon">
                    {opportunity.icon}
                  </div>

                  {selectedOpportunity?.id === opportunity.id && (
                    <FiCheckCircle className="earn-selected-icon" />
                  )}
                </div>

                <div className="earn-opportunity-content">
                  <h3>{opportunity.title}</h3>
                  <p>{opportunity.description}</p>
                </div>

                <div className="earn-opportunity-action">
                  <span>Contribute</span>
                  <FiArrowRight />
                </div>
              </motion.button>
            ))}
          </motion.div>
        </motion.section>

        {/* Selected Opportunity */}
        <AnimatePresence mode="wait">
          {selectedOpportunity && !showInsightForm && !submitted && (
            <motion.section
              key="selected-opportunity"
              className="earn-contribution-panel glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <div className="earn-panel-icon">
                {selectedOpportunity.icon}
              </div>

              <div className="earn-panel-content">
                <span className="earn-eyebrow">SELECTED CONTRIBUTION</span>

                <h2>{selectedOpportunity.title}</h2>

                <p>{selectedOpportunity.description}</p>

                <div className="earn-panel-note">
                  <FiCheckCircle />
                  <span>
                    Contributions are reviewed before they are accepted.
                  </span>
                </div>

                <button
                  type="button"
                  className="earn-primary-button"
                  onClick={() => setShowInsightForm(true)}
                >
                  Continue
                  <FiArrowRight />
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Different Insight */}
        <motion.section
          className="earn-insight glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="earn-insight-icon" style={{ marginLeft: 10 }}>
            <FiAlignCenter />
          </div>

          <div className="earn-insight-content">
            <span className="earn-eyebrow">SOMETHING ELSE?</span>

            <h2>Have a different insight for us?</h2>
            <p>
              See something that G.R.O.A. isn't currently asking about?
              Tell us. Your observation may help us understand something we
              haven't considered.
            </p>

            <button
              type="button"
              className="earn-secondary-button"
              onClick={() => {
                setShowInsightForm(true);
                setSelectedOpportunity(null);
                setSubmitted(false);
              }}
            >
              Share an Insight
              <FiAlignCenter />
            </button>
          </div>
        </motion.section>

        {/* Contribution Form */}
        <AnimatePresence mode="wait">
          {showInsightForm && !submitted && (
            <motion.section
              key="contribution-form"
              className="earn-form-wrapper glass"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <div className="earn-form-header">
                <div className="earn-form-title-icon" style={{ marginLeft: 10 }}>
                  <FiSend />
                </div>

                <div>
                  <span className="earn-eyebrow">YOUR CONTRIBUTION</span>

                  <h2>
                    {selectedOpportunity
                      ? selectedOpportunity.title
                      : "Share an Insight"}
                  </h2>

                  <p>
                    Provide the information you believe G.R.O.A. should know.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="earn-form-grid" style={{ padding: 10 }}>
                  <div className="earn-field">
                    <label htmlFor="name">
                      <FiUser />
                      Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="earn-field">
                    <label htmlFor="email">
                      <FiMail />
                      Email
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="earn-field">
                    <label htmlFor="phone">
                      <FiPhone />
                      Phone number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+123 456 7890"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="earn-field earn-field-full">
                    <label htmlFor="information">
                      <FiMessageSquare />
                      Your information
                    </label>

                    <textarea
                      id="information"
                      name="information"
                      rows="7"
                      placeholder="Tell G.R.O.A. what you know, observed, or discovered..."
                      value={formData.information}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="earn-form-footer" style={{ padding: 10 }}>
                  <p>
                    <FiCheckCircle />
                    If your contribution is selected for compensation, G.R.O.A.
                    will contact you privately using the information provided.
                  </p>

                  <button
                    type="submit"
                    className="earn-primary-button"
                  >
                    Submit Contribution
                    <FiSend />
                  </button>
                </div>
              </form>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Success */}
        <AnimatePresence>
          {submitted && (
            <motion.section
              className="earn-success glass"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="earn-success-icon">
                <FiCheckCircle />
              </div>

              <span className="earn-eyebrow">SUBMISSION RECEIVED</span>

              <h2>Thank you for contributing.</h2>

              <p>
                Your information has been submitted to G.R.O.A. for review.
                If your contribution is selected, we will contact you privately
                using the details you provided.
              </p>

              <button
                type="button"
                className="earn-secondary-button"
                onClick={resetForm}
              >
                Make Another Contribution
                <FiArrowRight />
              </button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer Note */}
        <motion.div
          className="earn-bottom-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <FiActivity />
          <span>
            G.R.O.A. reviews submitted information before it becomes part of
            its intelligence ecosystem.
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Earn