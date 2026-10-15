import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import logo from "../assets/logo.svg";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDangerModal, setIsDangerModal] = useState(false)
  const [isWarningModal, setIsWarningModal] = useState(false)
  const [isSafeModal, setIsSaferModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 800);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/map", label: "Map" },
    { path: "/alerts", label: "Alerts" },
    { path: "/regions", label: "Regions" },
    { path: "/crises", label: "Crises" },
    { path: "/news", label: "News" },
    { path: "/about", label: "About" },
  ];

  return (
    <motion.header
      className={`${isScrolled ? "scrolled glass" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="header-container container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "1400px",
        }}
      >
        <div className="header-container logo-container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer",
          }}
        >
          <button
            className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleMobileMenu();
            }}
            style={{
              display: !isMobile ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "35px",
              height: "35px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              zIndex: 1001,
            }}
          >
            <span style={{
              display: "block",
              width: "24px",
              height: "24px",
              margin: "4px 0",
              backgroundColor: "white",
              borderRadius: "3px",
              transition: "all 0.3s ease",
            }}>=</span>
          </button>
          <img
            src={logo}
            alt="G.R.O.A"
            style={{
              height: isScrolled ? "32px" : "40px",
              transition: "all 0.3s",
              color: "white",
            }}
          />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                className="mobile-menu-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.5)",
                  zIndex: 999,
                }}
              />
              <motion.nav
                className="mobile-sidebar"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  width: "280px",
                  height: "100vh",
                  zIndex: 1000,
                }}
              >
                <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column" }}>
                  <button
                    onClick={closeMobileMenu}
                    style={{
                      alignSelf: "flex-end",
                      background: "none",
                      border: "none",
                      fontSize: "2rem",
                      cursor: "pointer",
                      color: "var(--text-primary)",
                      padding: "0.5rem",
                    }}
                  >
                    ×
                  </button>
                  <ul style={{ listStyle: "none", flex: 1, padding: 0 }}>
                    {navItems.map((item) => (
                      <li key={item.path} style={{ marginBottom: "1rem" }}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) => (isActive ? "active" : "")}
                          onClick={closeMobileMenu}
                          style={{
                            display: "block",
                            padding: "1rem",
                            fontSize: "1.1rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <nav className="main-nav">
          <ul className="nav-list" style={{ gap: "2rem" }}>
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="report-btn-container">
          <div className="danger-levels">
            <button
              //onClick={() => setIsSaferModal(true)} 
              className="warning-btn-level green"
            >
              🟢
            </button>
            <button
              //onClick={() => setIsWarningModal(true)} 
              className="warning-btn-level yellow"
            >
              🟡
            </button>
            <button
              //onClick={() => setIsDangerModal(true)} 
              className="warning-btn-level red"
            >
              🔴
            </button>
          </div>
        </div>
      </div>

      {/* Danger Modal */}
      <AnimatePresence>
        {isDangerModal && (
          <motion.div
            className="threat-info-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="threat-info">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h4 className="threat-level-danger">🔴</h4>
                <FiX
                  onClick={() => setIsDangerModal(false)}
                  style={{
                    cursor: 'pointer'
                  }}
                  size={16}
                />
              </div>
              <h3>Danger/Threat Alerts & Level</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Modal */}
      <AnimatePresence>
        {isWarningModal && (
          <motion.div
            className="threat-info-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="threat-info">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h4 className="threat-level-warning">🟡</h4>
                <FiX
                  onClick={() => setIsWarningModal(false)}
                  style={{
                    cursor: 'pointer'
                  }}
                  size={16}
                />
              </div>
              <h3>Warning/Caution Alerts & Level</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe Modal */}
      <AnimatePresence>
        {isSafeModal && (
          <motion.div
            className="threat-info-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="threat-info">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h4 className="threat-level-safe">🟢</h4>
                <FiX
                  onClick={() => setIsSaferModal(false)}
                  style={{
                    cursor: 'pointer'
                  }}
                  size={16}
                />
              </div>
              <h3>Safe/info Alerts & Level</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
