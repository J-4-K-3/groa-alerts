import React from "react";
import { motion } from "framer-motion";
import { FiX, FiSettings } from "react-icons/fi";
import './PopupStyles.css'

const SettingsPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const tabs = [
    // { id: '', label: '', icon: < /> }, <- should look like this
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          width: "80%",
          height: "100%",
          background: "var(--bg-color)",
          borderRadius: "1rem",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(15, 20, 28, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              <FiSettings />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Settings</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "var(--hover-bg)")
            }
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "10px",
            height: "calc(100% - 100px)",
            overflowY: "auto",
          }}
        >
          <div className="setting-content">
            <div className="setting-options">
            </div>
            <div className="setting-options-content"></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPopup;
