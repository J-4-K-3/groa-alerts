import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMap,
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiCompass
} from 'react-icons/fi'

const Compass = () => {
  const [situation, setSituation] = useState('')
  const [location, setLocation] = useState('')
  const [destination, setDestination] = useState('')

  const situations = [
    {
      value: "wilderness",
      label: "Lost in wilderness",
      description: "Find a road, trail, station, or safe area.",
      icon: "🌲",
    },
    {
      value: "urban",
      label: "Lost in an urban area",
      description: "Find your way through a city or unfamiliar area.",
      icon: "🏙️",
    },
    {
      value: "stranded",
      label: "Stranded",
      description: "Find nearby roads, services, or assistance.",
      icon: "🚗",
    },
    {
      value: "medical",
      label: "Need medical assistance",
      description: "Find the nearest suitable medical facility.",
      icon: "🏥",
    },
    {
      value: "safe",
      label: "Need a safe location",
      description: "Find a suitable safe destination nearby.",
      icon: "🛡️",
    },
    {
      value: "emergency",
      label: "Emergency",
      description: "Find the most appropriate nearby assistance.",
      icon: "🚨",
    },
  ];

  const destinations = [
    { value: "road", label: "Nearest road", icon: "🛣️" },
    { value: "station", label: "Station / service point", icon: "🏢" },
    { value: "medical", label: "Medical facility", icon: "🏥" },
    { value: "safe", label: "Safe location", icon: "🛡️" },
    { value: "assistance", label: "Emergency assistance", icon: "🚨" },
    { value: "unknown", label: "I don't know — help me", icon: "🧭" },
  ];

  const handleFindWay = () => {
    console.log({
      situation,
      location,
      destination,
    });

    // Later:
    // Send this information to the G.R.O.A. navigation system.
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
            Compass
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Tell G.R.O.A. what situation you're in and where you are.
            We'll help determine where you should go next.
          </p>
        </motion.div>

        {/* Compass Workspace */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="compass-workspace"
        >
          {/* MAP */}
          <div className="compass-map card glass">
            <div className="compass-map-header">
              <div>
                <div className="compass-map-title">
                  <FiMap />
                  <span>G.R.O.A. Map</span>
                </div>

                <span className="compass-map-status">
                  Awaiting navigation request
                </span>
              </div>

              <div className="compass-map-location">
                <FiMapPin />
                Location inactive
              </div>
            </div>

            <div className="compass-map-view">
              <div className="map-grid" />

              <div className="map-placeholder">
                <FiNavigation />

                <h3>Navigation Map</h3>

                <p>
                  Your route and relevant locations will appear here
                  after G.R.O.A. processes your request.
                </p>
              </div>
            </div>

            <div className="compass-map-footer">
              <span>
                <FiMapPin />
                Your location
              </span>

              <span>
                <FiNavigation />
                Recommended route
              </span>

              <span>
                <FiAlertCircle />
                Relevant conditions
              </span>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="compass-controls card glass">
            <div className="compass-controls-header">
              <div className="compass-icon">
                <FiCompass />
              </div>

              <div>
                <h2>Find Your Way</h2>
                <p>
                  Give G.R.O.A. the information you know.
                </p>
              </div>
            </div>

            {/* Situation */}
            <div className="compass-form-section">
              <div className="compass-section-label">
                <span>01</span>
                <div>
                  <h3>What's your situation?</h3>
                  <p>Select the option that best describes what you're
                    dealing with.</p>
                </div>
              </div>

              <div className="situation-grid">
                {situations.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`situation-option ${situation === item.value ? "selected" : ""
                      }`}
                    onClick={() => setSituation(item.value)}
                  >
                    <span className="situation-icon">
                      {item.icon}
                    </span>

                    <span className="situation-content">
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>

                    {situation === item.value && (
                      <FiCheckCircle className="situation-check" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="compass-form-section">
              <div className="compass-section-label">
                <span>02</span>
                <div>
                  <h3>Where are you?</h3>
                  <p>
                    Enter a name, landmark, area, or anything that helps
                    identify your location.
                  </p>
                </div>
              </div>

              <div className="compass-input-wrapper">
                <FiMapPin />

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Near the old forest road"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="compass-form-section">
              <div className="compass-section-label">
                <span>03</span>
                <div>
                  <h3>What are you trying to reach?</h3>
                  <p>
                    You can choose a destination type or let G.R.O.A.
                    determine one.
                  </p>
                </div>
              </div>

              <div className="destination-grid">
                {destinations.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`destination-option ${destination === item.value ? "selected" : ""
                      }`}
                    onClick={() => setDestination(item.value)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              className="compass-submit"
              disabled={!situation || !location}
              onClick={handleFindWay}
            >
              <FiSearch />
              Find My Way
            </button>

            <div className="compass-disclaimer">
              <FiAlertCircle />
              G.R.O.A. uses your provided information and available
              location data to determine relevant navigation options.
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>

  )
}

export default Compass