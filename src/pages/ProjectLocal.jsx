import { motion } from "framer-motion";

const ProjectLocal = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
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
            Project L.O.C.A.L
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            One country. One week. Every year. Project L.O.C.A.L is G.R.O.A's focused initiative for creating meaningful, measurable impact where it matters most.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.div variants={itemVariants} className="card local-feature-card">
            <div className="local-feature-header">
              <div>
                <span className="local-eyebrow">CURRENT PROJECT</span>
                <h2>Project L.O.C.A.L 2027</h2>

                <p>The next country selected for G.R.O.A's annual one-week focused initiative.</p>
              </div>

              <div className="local-status">
                <span className="local-status-dot" /> PLANNING
              </div>
            </div>

            <div className="local-country">
              <div className="local-country-icon">🌍</div>
              <div>
                <span>Selected Country</span>
                <h3>To be Announced</h3>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="local-principle-grid">
            <div className="card">
              <span className="local-card-icon">🎯</span>
              <h3>One Country</h3>

              <p>Every year, G.R.O.A focuses its attention on one country and its communities</p>
            </div>

            <div className="card">
              <span className="local-card-icon">🗓️</span>
              <h3>One Week</h3>

              <p>A concentrated week of research, awareness, assistance and action</p>
            </div>

            <div className="card">
              <span className="local-card-icon">🌿</span>
              <h3>Real Impact</h3>

              <p>The objective is not simply to observe problems, but to help create measurable positive change</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card local-focus-card">
            <div className="local-section-heading">
              <div>
                <span className="local-eyebrow">MISSION FOCUS</span>
                <h2>What G.R.O.A Can Do</h2>
              </div>
            </div>

            <div className="local-focus-grid">
              <div className="local-focus-item">
                <span>🚨</span>
                <div>
                  <h3>Safety Awareness</h3>
                  <p>Surface important risks, threats and safety information</p>
                </div>
              </div>

              <div className="local-focus-item">
                <span>🛰️</span>
                <div>
                  <h3>Information</h3>
                  <p>Help people understand what is happening around them</p>
                </div>
              </div>

              <div className="local-focus-item">
                <span>🤝</span>
                <div>
                  <h3>Organization</h3>
                  <p>Connect relevant information and requests with organizations that can help</p>
                </div>
              </div>

              <div className="local-focus-item">
                <span>🌿</span>
                <div>
                  <h3>Community Impact</h3>
                  <p>Support initiatives designed around the needs of the selected community</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="section-title">Project Impact</h2>

            <div className="grid local-stats-grid">
              <div className="card local-stat-card">
                <span>Countries Reached</span>
                <strong>0</strong>
              </div>

              <div className="card local-stat-card">
                <span>Projects Completed</span>
                <strong>0</strong>
              </div>

              <div className="card local-stat-card">
                <span>People Reached</span>
                <strong>0</strong>
              </div>

              <div className="card local-stat-card">
                <span>Organizations Involved</span>
                <strong>0</strong>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card local-history-card">
            <div className="local-section-heading">
              <div>
                <span className="local-eyebrow">HISTORY</span>
                <h2>Previous Projects</h2>
              </div>
            </div>

            <div className="local-empty-state">
              <span>🌍</span>
              <h3>The journey is beginning</h3>

              <p>Project L.O.C.A.L will document each annual mission here as G.R.O.A grows</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ProjectLocal