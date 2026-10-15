import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiHome,
  FiCoffee,
  FiHeart,
  FiMessageCircle,
  FiAlertTriangle,
  FiMapPin,
  FiHelpCircle,
  FiArrowRight,
} from "react-icons/fi";

const Support = () => {
  const [selectedSupport, setSelectedSupport] = useState(null);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1, transition: {
        staggerChildren: 0.1
      },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  const supportOptions = [
    {
      id: "safe-place",
      icon: <FiHome />,
      title: "A Safe Place",
      description: "Find somewhere safer to stay or go.",
    },
    {
      id: "basic-needs",
      icon: <FiCoffee />,
      title: "Basic Needs",
      description: "Find help with essential needs and supplies.",
    },
    {
      id: "medical",
      icon: <FiHeart />,
      title: "Medical Help",
      description: "Find appropriate medical assistance nearby.",
    }, {
      id: "talk",
      icon: <FiMessageCircle />,
      title: "Someone to Talk To",

      description: "Find someone willing and able to listen.",
    }, {
      id: "danger",
      icon: <FiAlertTriangle />,
      title: "Immediate Danger",
      description: "Get directed toward appropriate emergency assistance.", danger: true,
    },
    {
      id: "somewhere",
      icon: <FiMapPin />,
      title: "Help Finding Somewhere",
      description: "Tell G.R.O.A. where you need to get to.",
    }, {
      id: "something-else",
      icon: <FiHelpCircle />,
      title: "Something Else",
      description: "Tell G.R.O.A. what you're looking for.",
    },
  ];

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
            Basic Support
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            If you're struggling right now, we can help you find a practical place to start.
          </p>
        </motion.div>

        <motion.div
          className="support-workspace"
          variants={containerVariants}
          initial="hidden"
          animate="visible" >
          <motion.div
            className="support-workspace-header"
            variants={itemVariants} >
            <div>
              <span className="support-eyebrow">G.R.O.A. SUPPORT</span>
              <h2>What do you need right now?</h2>
              <p> Choose what best describes what you need. G.R.O.A. will help determine where to direct you next. </p>
            </div>
          </motion.div>
          <div
            className="support-grid">
            {supportOptions.map((option) => (
              <motion.button
                key={option.id}
                type="button"
                className={`
                  support-option 
                  ${selectedSupport === option.id ? "selected" : ""} 
                  ${option.danger ? "support-danger" : ""}`
                }
                variants={itemVariants}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSupport(option.id)} >
                <div className="support-option-icon">
                  {option.icon}
                </div>
                <div className="support-option-content">
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                </div>
                <FiArrowRight className="support-option-arrow" />
              </motion.button>
            ))}
          </div>
          <motion.div className="support-guidance" variants={itemVariants} >
            <div className="support-guidance-icon">
              <FiHeart />
            </div>
            <div>
              <h3>G.R.O.A. won't take over your life.</h3>
              <p> We help you find a practical next step, then leave the choice with you. </p> </div>
          </motion.div>
          {selectedSupport && (
            <motion.div
              className="support-selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }} >
              <div>
                <span>SELECTED</span>
                <strong>
                  {supportOptions.find((option) => option.id === selectedSupport)?.title}
                </strong>
              </div>
              <button type="button"
                onClick={() => {
                  // Connect this to the appropriate G.R.O.A. support flow. 
                }}
              >
                Continue <FiArrowRight />
              </button>
            </motion.div>
          )}
        </motion.div>
        <motion.p
          className="support-disclaimer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          G.R.O.A. provides guidance and connections to available support. Availability and services may
          vary by location.
        </motion.p>
      </div>
    </motion.div>
  )
}

export default Support