import { useState } from "react";
import { motion } from "framer-motion"

const Plane = () => {
  const [search, setSearch] = useState("");
  const [selectedPlane, setSelectedPlane] = useState(null);

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
      transition: { duration: 0.35 },
    },
  };

  // Temporary data.
  // This will eventually come from the flight-tracking API.
  const aircraft = [
    {
      id: "1",
      callsign: "AFR382",
      airline: "Air France",
      aircraft: "Airbus A350-900",
      registration: "F-HREV",
      origin: "Paris CDG",
      destination: "Johannesburg JNB",
      altitude: "37,000 ft",
      speed: "487 kt",
      heading: "164°",
      status: "En Route",
      position: "South Atlantic",
    },
    {
      id: "2",
      callsign: "SAA204",
      airline: "South African Airways",
      aircraft: "Airbus A330-300",
      registration: "ZS-SXD",
      origin: "Johannesburg JNB",
      destination: "Frankfurt FRA",
      altitude: "35,000 ft",
      speed: "471 kt",
      heading: "348°",
      status: "En Route",
      position: "Central Africa",
    },
    {
      id: "3",
      callsign: "ET908",
      airline: "Ethiopian Airlines",
      aircraft: "Boeing 787-9",
      registration: "ET-AYC",
      origin: "Addis Ababa ADD",
      destination: "Kinshasa FIH",
      altitude: "33,000 ft",
      speed: "452 kt",
      heading: "247°",
      status: "Approaching",
      position: "DRC",
    },
  ];

  const filteredAircraft = aircraft.filter((plane) => {
    const query = search.toLowerCase();

    return (
      plane.callsign.toLowerCase().includes(query) ||
      plane.airline.toLowerCase().includes(query) ||
      plane.registration.toLowerCase().includes(query)
    );
  });

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
            Plane Tracking
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Track aircraft movements and view available flight information
            in real time
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          {/* Search */}
          <motion.div
            variants={itemVariants}
            className="glass plane-search-card"
          >
            <div>
              <span className="plane-label">
                AIRCRAFT SEARCH
              </span>

              <h2>Find an aircraft</h2>

              <p>
                Search by flight number, callsign, airline, or registration.
              </p>
            </div>

            <div className="plane-search">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. AFR382, SAA204, F-HREV..."
              />

              <button type="button">
                Search
              </button>
            </div>
          </motion.div>


          {/* Tracking area */}
          <motion.div
            variants={itemVariants}
            className="glass plane-map"
          >
            <div className="plane-map-header">
              <div>
                <span className="plane-label">
                  LIVE AIRSPACE
                </span>

                <h2>Aircraft Overview</h2>
              </div>

              <div className="plane-live-status">
                <span />
                LIVE
              </div>
            </div>

            {/* Temporary map surface */}
            <div className="plane-map-surface">

              <div className="plane-map-grid" />

              <div className="plane-route route-one" />
              <div className="plane-route route-two" />

              {aircraft.map((plane, index) => (
                <motion.button
                  key={plane.id}
                  type="button"
                  className={`plane-marker plane-marker-${index + 1}`}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setSelectedPlane(plane)}
                  title={plane.callsign}
                >
                  ✈
                </motion.button>
              ))}

              <div className="plane-map-center">
                AIRSPACE MONITOR
              </div>

            </div>
          </motion.div>


          {/* Selected aircraft */}
          {selectedPlane && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass plane-details"
            >
              <div className="plane-details-top">
                <div>
                  <span className="plane-label">
                    SELECTED AIRCRAFT
                  </span>

                  <h2>{selectedPlane.callsign}</h2>

                  <p>
                    {selectedPlane.airline} · {selectedPlane.aircraft}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPlane(null)}
                >
                  Close
                </button>
              </div>

              <div className="plane-details-grid">

                <div>
                  <span>Registration</span>
                  <strong>{selectedPlane.registration}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{selectedPlane.status}</strong>
                </div>

                <div>
                  <span>Altitude</span>
                  <strong>{selectedPlane.altitude}</strong>
                </div>

                <div>
                  <span>Speed</span>
                  <strong>{selectedPlane.speed}</strong>
                </div>

                <div>
                  <span>Heading</span>
                  <strong>{selectedPlane.heading}</strong>
                </div>

                <div>
                  <span>Position</span>
                  <strong>{selectedPlane.position}</strong>
                </div>

              </div>

              <div className="plane-route-info">
                <div>
                  <span>Origin</span>
                  <strong>{selectedPlane.origin}</strong>
                </div>

                <div className="plane-route-arrow">
                  →
                </div>

                <div>
                  <span>Destination</span>
                  <strong>{selectedPlane.destination}</strong>
                </div>
              </div>
            </motion.div>
          )}


          {/* Aircraft list */}
          <motion.div
            variants={itemVariants}
            className="plane-list-section"
          >
            <div className="plane-section-heading">
              <div>
                <span className="plane-label">
                  AIRCRAFT
                </span>

                <h2>Tracked Aircraft</h2>
              </div>

              <span className="plane-count">
                {filteredAircraft.length} detected
              </span>
            </div>

            <div className="plane-list">

              {filteredAircraft.length > 0 ? (
                filteredAircraft.map((plane) => (
                  <motion.button
                    key={plane.id}
                    type="button"
                    className="glass plane-card"
                    whileHover={{ y: -3 }}
                    onClick={() => setSelectedPlane(plane)}
                  >
                    <div className="plane-card-icon">
                      ✈
                    </div>

                    <div className="plane-card-main">
                      <strong>{plane.callsign}</strong>

                      <span>
                        {plane.airline} · {plane.aircraft}
                      </span>
                    </div>

                    <div className="plane-card-route">
                      <span>{plane.origin}</span>
                      <b>→</b>
                      <span>{plane.destination}</span>
                    </div>

                    <div className="plane-card-status">
                      <span />
                      {plane.status}
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="glass plane-empty">
                  <strong>No aircraft found</strong>
                  <p>
                    Try searching with a different flight number,
                    callsign, airline, or registration.
                  </p>
                </div>
              )}

            </div>
          </motion.div>


          {/* Data notice */}
          <motion.div
            variants={itemVariants}
            className="plane-data-notice glass"
          >
            <div className="plane-data-icon">
              i
            </div>

            <div>
              <strong>About aircraft data</strong>

              <p>
                Aircraft tracking information can be delayed, incomplete,
                or unavailable depending on coverage and data sources.
                G.R.O.A. presents available information and does not
                guarantee continuous aircraft visibility.
              </p>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </motion.div>
  )
}

export default Plane