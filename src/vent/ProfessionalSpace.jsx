import { motion } from "framer-motion";
import '../App.css'

const ProfessionalSpace = ({ onBack }) => {
  return (
    <div className="vent-space-page">
      <button
        className="vent-back-button"
        onClick={onBack}
      >
        ← Back to Vent Space
      </button>

      <div className="vent-space-heading">
        <span className="vent-eyebrow">
          PROFESSIONAL SUPPORT
        </span>

        <h1 className="text-gradient">
          Sometimes you need more than a conversation.
        </h1>

        <p>
          Connect with verified professionals when you
          want structured support.
        </p>
      </div>

      <div className="vent-professional-grid">
        <motion.div
          className="vent-professional-card glass"
          whileHover={{ y: -4 }}
        >
          <span className="vent-professional-icon">
            🧑‍⚕️
          </span>

          <h2>
            Professional Support
          </h2>

          <p>
            Connect with a verified professional based on
            the type of support you are looking for.
          </p>

          <button
            className="vent-primary-button"
            onClick={() => {
              /*
              Backend hook:
             
              openProfessionalMatching()
              */
            }}
          >
            Find Support →
          </button>
        </motion.div>

        <motion.div
          className="vent-professional-card glass"
          whileHover={{ y: -4 }}
        >
          <span className="vent-professional-icon">
            📋
          </span>

          <h2>
            How it works
          </h2>

          <p>
            Professionals should be verified before they
            are allowed to participate. Their role and
            qualifications should be clearly identified.
          </p>

          <div className="vent-professional-note">
            Verification happens before access, not after
            someone enters a conversation.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfessionalSpace;
