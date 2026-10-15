import { motion } from "framer-motion";
import '../App.css'

const VentHome = ({
  onSelect,
  containerVariants,
  itemVariants,
}) => {
  const spaces = [
    {
      id: "write",
      icon: "✍️",
      title: "Write",
      description:
        "Put your thoughts into words. No audience, no judgment, no saved history.",
    },
    {
      id: "talk",
      icon: "💬",
      title: "Talk",
      description:
        "Connect with someone randomly and have a real-time conversation.",
    },
    {
      id: "listener",
      icon: "👂",
      title: "Find a Listener",
      description:
        "Talk with someone who is there simply to listen.",
    },
    {
      id: "professional",
      icon: "🧑‍💼",
      title: "Professional Support",
      description:
        "Connect with verified professionals when you need more structured support.",
    },
  ];

  return (
    <div className="vent-home">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="vent-intro"
      >
        <motion.div variants={itemVariants}>
          <span className="vent-eyebrow">
            VENT SPACE
          </span>

          <h1 className="text-gradient">
            You don't have to keep it all inside.
          </h1>

          <p>
            A space to write, talk, or simply be heard.
            Choose what feels right for you.
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="vent-privacy-card"
      >
        <motion.div
          variants={itemVariants}
          className="vent-privacy-icon"
        >
          🔒
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3>Private by design</h3>

          <p>
            Vent Space interactions are designed to be
            temporary. Conversations are not presented as
            permanent posts, feeds, or conversation history.
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="vent-space-grid"
      >
        {spaces.map((space) => (
          <motion.button
            key={space.id}
            variants={itemVariants}
            className="vent-space-card"
            onClick={() => onSelect(space.id)}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="vent-space-card-icon">
              {space.icon}
            </span>

            <span className="vent-space-card-content">
              <strong>{space.title}</strong>

              <span>
                {space.description}
              </span>
            </span>

            <span className="vent-space-arrow">
              →
            </span>
          </motion.button>
        ))}
      </motion.div>

      <div className="vent-boundary-card">
        <span>⚠️</span>

        <div>
          <strong>Need immediate help?</strong>

          <p>
            Vent Space is for conversation and emotional
            support. It is not an emergency response service.
            If you are in immediate danger, contact your local
            emergency services or an appropriate crisis
            resource.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VentHome;
