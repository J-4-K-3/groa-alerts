import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Climate = () => {
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
      transition: { duration: 0.4 },
    },
  };

  const [region, setRegion] = useState("");
  const [topic, setTopic] = useState("");
  const [period, setPeriod] = useState("");
  const [view, setView] = useState("");

  const climateData = {
    temperature: {
      title: "Temperature",
      icon: "🌡️",
      label: "TEMPERATURE TREND",
      value: "+1.2°C",
      description:
        "Long-term temperature patterns provide an indication of how Earth's climate is changing.",
      trend: "Long-term warming trend",
      status: "Elevated",
    },

    rainfall: {
      title: "Rainfall",
      icon: "🌧️",
      label: "RAINFALL PATTERNS",
      value: "Variable",
      description:
        "Rainfall patterns can shift over time, affecting water availability, agriculture, and local ecosystems.",
      trend: "Pattern variation",
      status: "Monitor",
    },

    co2: {
      title: "CO₂",
      icon: "🌫️",
      label: "ATMOSPHERIC CO₂",
      value: "Elevated",
      description:
        "Carbon dioxide is one of the major greenhouse gases contributing to long-term global warming.",
      trend: "Increasing concentration",
      status: "Elevated",
    },

    seaLevel: {
      title: "Sea Level",
      icon: "🌊",
      label: "SEA LEVEL",
      value: "Rising",
      description:
        "Global sea levels have been rising over time due to warming oceans and melting land-based ice.",
      trend: "Long-term rise",
      status: "Monitor",
    },

    extremeWeather: {
      title: "Extreme Weather",
      icon: "⛈️",
      label: "EXTREME WEATHER",
      value: "Active",
      description:
        "Extreme weather events can include heatwaves, floods, droughts, severe storms, and other hazards.",
      trend: "Monitor regional activity",
      status: "Monitor",
    },

    drought: {
      title: "Drought",
      icon: "🏜️",
      label: "DROUGHT CONDITIONS",
      value: "Variable",
      description:
        "Drought conditions occur when an area experiences prolonged periods of unusually low precipitation.",
      trend: "Regional conditions vary",
      status: "Monitor",
    },

    flooding: {
      title: "Flooding",
      icon: "🌊",
      label: "FLOODING RISK",
      value: "Regional",
      description:
        "Heavy rainfall, changing precipitation patterns, and local conditions can contribute to flooding.",
      trend: "Regional monitoring required",
      status: "Monitor",
    },
  };

  const visibleData = useMemo(() => {
    if (!topic) return null;

    return climateData[topic] || null;
  }, [topic]);

  const regionLabel = useMemo(() => {
    const regions = {
      global: "Global",
      africa: "Africa",
      drc: "Democratic Republic of the Congo",
      hautKatanga: "Haut-Katanga",
      lubumbashi: "Lubumbashi",
    };

    return regions[region] || "Global";
  }, [region]);

  const periodLabel = useMemo(() => {
    const periods = {
      current: "Current",
      oneYear: "1 Year",
      fiveYears: "5 Years",
      tenYears: "10 Years",
      historical: "Historical",
    };

    return periods[period] || "Current";
  }, [period]);

  const resetFilters = () => {
    setRegion("");
    setTopic("");
    setPeriod("");
    setView("");
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
            Climate Change
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Explore verified climate information, long-term trends, and
            regional risks without overwhelming the picture.
          </p>
        </motion.div>

        {/* FILTERS */}
        <motion.section
          className="climate-filter-card glass card"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="climate-filter-header">
            <div>
              <span className="climate-label">CLIMATE EXPLORER</span>
              <h2>Choose what you want to see</h2>
              <p>
                Filter the information to keep the climate dashboard focused
                on what matters to you.
              </p>
            </div>

            {(region || topic || period || view) && (
              <button
                type="button"
                className="climate-reset-btn"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>

          <div className="climate-filter-grid">
            <div className="climate-filter-control">
              <label htmlFor="climate-region">Region</label>

              <select
                id="climate-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">Select region</option>
                <option value="global">Global</option>
                <option value="africa">Africa</option>
                <option value="drc">
                  Democratic Republic of the Congo
                </option>
                <option value="hautKatanga">Haut-Katanga</option>
                <option value="lubumbashi">Lubumbashi</option>
              </select>
            </div>

            <div className="climate-filter-control">
              <label htmlFor="climate-topic">Topic</label>

              <select
                id="climate-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="">Select topic</option>
                <option value="temperature">Temperature</option>
                <option value="rainfall">Rainfall</option>
                <option value="co2">CO₂</option>
                <option value="seaLevel">Sea Level</option>
                <option value="extremeWeather">
                  Extreme Weather
                </option>
                <option value="drought">Drought</option>
                <option value="flooding">Flooding</option>
              </select>
            </div>

            <div className="climate-filter-control">
              <label htmlFor="climate-period">Time period</label>

              <select
                id="climate-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="">Select period</option>
                <option value="current">Current</option>
                <option value="oneYear">1 Year</option>
                <option value="fiveYears">5 Years</option>
                <option value="tenYears">10 Years</option>
                <option value="historical">Historical</option>
              </select>
            </div>

            <div className="climate-filter-control">
              <label htmlFor="climate-view">View</label>

              <select
                id="climate-view"
                value={view}
                onChange={(e) => setView(e.target.value)}
              >
                <option value="">Select view</option>
                <option value="overview">Overview</option>
                <option value="trends">Trends</option>
                <option value="risks">Risks</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* EMPTY STATE */}
        <AnimatePresence mode="wait">
          {!topic && (
            <motion.div
              key="climate-empty"
              className="climate-empty glass card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div className="climate-empty-icon">🌍</div>

              <h2>Explore Climate Data</h2>

              <p>
                Select a topic above to see climate information. G.R.O.A.
                keeps the dashboard focused so you can investigate one area
                at a time.
              </p>
            </motion.div>
          )}

          {/* RESULT */}
          {topic && visibleData && (
            <motion.section
              key={`${region}-${topic}-${period}-${view}`}
              className="climate-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="climate-result-heading">
                <div>
                  <span className="climate-label">CLIMATE DATA</span>

                  <h2>
                    {visibleData.icon} {visibleData.title}
                  </h2>

                  <p>
                    {regionLabel} • {periodLabel}
                    {view ? ` • ${view}` : ""}
                  </p>
                </div>
              </div>

              <motion.div
                className="climate-data-card glass card"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="climate-card-top">
                  <div>
                    <span className="climate-card-label">
                      {visibleData.label}
                    </span>

                    <h3>{visibleData.title}</h3>
                  </div>

                  <div className="climate-card-icon">
                    {visibleData.icon}
                  </div>
                </div>

                <div className="climate-card-value">
                  {visibleData.value}
                </div>

                <p className="climate-card-description">
                  {visibleData.description}
                </p>

                <div className="climate-card-meta">
                  <div>
                    <span>REGION</span>
                    <strong>{regionLabel}</strong>
                  </div>

                  <div>
                    <span>PERIOD</span>
                    <strong>{periodLabel}</strong>
                  </div>

                  <div>
                    <span>STATUS</span>
                    <strong>{visibleData.status}</strong>
                  </div>

                  <div>
                    <span>TREND</span>
                    <strong>{visibleData.trend}</strong>
                  </div>
                </div>

                {/* VISUALIZATION PLACEHOLDER */}
                <div className="climate-chart-placeholder">
                  <div className="climate-chart-header">
                    <span>CLIMATE TREND</span>
                    <span>{periodLabel}</span>
                  </div>

                  <div className="climate-chart">
                    <div className="climate-chart-line" />

                    <div className="climate-chart-point point-one" />
                    <div className="climate-chart-point point-two" />
                    <div className="climate-chart-point point-three" />
                    <div className="climate-chart-point point-four" />
                    <div className="climate-chart-point point-five" />
                  </div>

                  <div className="climate-chart-axis">
                    <span>Past</span>
                    <span>Present</span>
                  </div>
                </div>
              </motion.div>

              {/* VERIFICATION NOTICE */}
              <motion.div
                className="climate-verification glass card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="climate-verification-icon">✓</div>

                <div>
                  <h3>About this information</h3>

                  <p>
                    Climate information displayed by G.R.O.A. should be
                    sourced, reviewed, and clearly identified according to
                    its level of confidence. Data is not presented as fact
                    simply because it exists.
                  </p>
                </div>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default Climate