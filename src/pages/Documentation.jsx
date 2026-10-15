import { useState } from "react";
import { motion } from "framer-motion";

const Documentation = () => {
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
            Documentation
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {/* Adjust wording is necessary, this is not an API place */}
            Understanding how the G.R.O.A work in a more detailed and thorough manner
          </p>
        </motion.div>

        {/* Start below comment */}
      </div>
    </motion.div>
  )
}

export default Documentation