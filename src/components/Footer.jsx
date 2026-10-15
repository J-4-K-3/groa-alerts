import { motion } from "framer-motion";
import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiMail,
  FiGlobe,
  FiSettings,
  FiCheck
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.svg";

// Import popup components
import TelvinPopup from "./popups/TelvinPopup";
import OmniPopup from "./popups/OmniMode";
import UpvotePopup from "./popups/Upvote";
import AuthenPopup from "./popups/AuthenPopup";
import EvacuationRoutesPopup from "./popups/EvacuationRoutesPopup";
import SafeZonesPopup from "./popups/SafeZonesPopup";
import SafetyProtocolsPopup from "./popups/SafetyProtocolsPopup";
import TrainingProgramsPopup from "./popups/TrainingProgramsPopup";
import FeaturePopup from "./popups/FeatureRequest";
import CommunityNotesPopup from "./popups/CommunityNotesPopup";
import PredictionsPopup from "./popups/PredictionsPopup";
import AnonymousTipsPopup from "./popups/AnonymousTipsPopup";
import LocalNetworksPopup from "./popups/LocalNetworksPopup";
import SupportGroupsPopup from "./popups/SupportGroupsPopup";
import DiscussionsPopup from "./popups/DiscussionsPopup";
import VotingsPopup from "./popups/VotingsPopup";
import ReportVerificationPopup from "./popups/ReportVerificationPopup";
import ImpactTrackingPopup from "./popups/ImpactTrackingPopup";
import RequestDataPopup from "./popups/RequestDataPopup";
import ReportIssuePopup from "./popups/ReportIssue";
import CollaborativeMappingPopup from "./popups/CollaborativeMappingPopup";
import FBIPopup from "./popups/FbiModePopup";
import SolutionPopup from "./popups/SolutionPopup";
import SurveyPopup from "./popups/SurveyPopup";
import IdeaPopup from "./popups/IdeaSwopPopup";
import CollaborativeTipsPopup from "./popups/CollaborativeTipsPopup";
import LanguagePopup from "./popups/LanguagePopup";
import SettingsPopup from "./popups/SettingsPopup";

const Footer = () => {
  // State for popup visibility
  const [telvinChat, setTelvinChat] = useState(false);
  const [omniMode, setOmniMode] = useState(false);
  const [upvote, setUpvote] = useState(false);
  const [authen, setAuthen] = useState(false);
  const [requestData, setRequestData] = useState(false);
  const [reportIssue, setReportIssue] = useState(false)
  const [showEvacuationRoutes, setShowEvacuationRoutes] = useState(false);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [showSafetyProtocols, setShowSafetyProtocols] = useState(false);
  const [showTrainingPrograms, setShowTrainingPrograms] = useState(false);
  const [featureRequest, setFeatureRequest] = useState(false)
  const [showCommunityNotes, setShowCommunityNotes] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showAnonymousTips, setShowAnonymousTips] = useState(false);
  const [showLocalNetworks, setShowLocalNetworks] = useState(false);
  const [showSupportGroups, setShowSupportGroups] = useState(false);
  const [showDiscussions, setShowDiscussions] = useState(false);
  const [showVotings, setShowVotings] = useState(false);
  const [showReportVerification, setShowReportVerification] = useState(false);
  const [showImpactTracking, setShowImpactTracking] = useState(false);
  const [showCollaborativeMapping, setShowCollaborativeMapping] = useState(false);
  const [fbi, setFbi] = useState(false)
  const [solution, setSolution] = useState(false)
  const [survey, setSurvey] = useState(false)
  const [ideaSwop, setIdeaSwop] = useState(false)
  const [showCollaborativeTips, setShowCollaborativeTips] = useState(false);
  const [language, setLanguage] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <div className="footer-subscription" style={{ marginBottom: 60 }}>
          <form
            style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}
          >
            <input
              type="text"
              className="glass"
              placeholder="Subscribe to our news letter"
              style={{
                width: "100%",
                padding: "1.2rem 1.5rem 1.2rem 3.5rem",
                borderRadius: "1rem",
                border: "1px solid var(--border-color)",
                fontSize: "1.1rem",
                color: "white",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="sub-btn"
            >
              <FiCheck size={30} />
            </button>
          </form>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginTop: 5 }}>Letters arrive every 2 days once a week</p>
        </div>
        <div
          className="footer-grid"
        >
          <div>
            <Link
              to="/"
              className="footer-logo"
            >
              <img src={logo} alt="G.R.O.A" className="footer-logo-img" />
            </Link>
            <p className="footer-description"
            >
              Global Risk Observation & Analysis providing real-time, verified
              situational awareness for humanitarian response and individual
              safety.
            </p>
            {/*<div className="footer-socials">
              <motion.a
                whileHover={{ color: "var(--accent-color)", y: -2 }}
                href="#"
              >
                <FiTwitter />
              </motion.a>
              <motion.a
                whileHover={{ color: "var(--accent-color)", y: -2 }}
                href="#"
              >
                <FiLinkedin />
              </motion.a>
              <motion.a
                whileHover={{ color: "var(--accent-color)", y: -2 }}
                href="#"
              >
                <FiGithub />
              </motion.a>
              <motion.a
                whileHover={{ color: "var(--accent-color)", y: -2 }}
                href="#"
              >
                <FiMail />
              </motion.a>
            </div>*/}
          </div>

          <div>
            <h4 className="footer-h4">Company</h4>
            <ul className="footer-nav">
              <li>
                <span
                  onClick={() => setShowPredictions(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Predictions
                </span>
              </li>
              <li>
                <span onClick={() => setTelvinChat(true)} style={{ cursor: "pointer", color: "var(--text-secondary)" }}>
                  Telvin
                </span>
              </li>
              <li>
                <span 
                  //onClick={() => setOmniMode(true)} 
                  style={{ cursor: "pointer", color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  Omni Mode
                </span>
              </li>

              <li>
                <Link 
                  //to="/local" 
                  style={{ color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  Project L.O.C.A.L
                </Link>
              </li>

              <li>
                <Link to="/givedata" style={{ color: "var(--text-secondary)" }}>
                  Give us Data
                </Link>
              </li>
              <li>
                <span onClick={() => setUpvote(true)} style={{ cursor: 'pointer', color: "var(--text-secondary)" }}>
                  Platform Upvote
                </span>
              </li>
              <li>
                <Link 
                  //to="/earn" 
                  style={{ color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  Earn with G.R.O.A
                </Link>
              </li>
              <li>
                <span onClick={() => setAuthen(true)} style={{ cursor: 'pointer', color: "var(--text-secondary)" }}>
                  Authen
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-h4">Platform</h4>
            <ul className="footer-nav"
            >
              <li>
                <Link to="/submit-report" style={{ color: "var(--text-secondary)" }}>
                  Report Emergency
                </Link>
              </li>
              <li>
                <Link to="/compass" style={{ color: "var(--text-secondary)" }}>
                  Compass
                </Link>
              </li>
              <li>
                <Link to="/weather" style={{ color: "var(--text-secondary)" }}>
                  Weather Forecast
                </Link>
              </li>
              <li>
                <Link to="/plane-tracking" style={{ color: "var(--text-secondary)" }}>
                  Plane Tracking
                </Link>
              </li>
              <li>
                <Link 
                  //to="/climate-change" 
                  style={{ color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  Climate Change
                </Link>
              </li>
              <li>
                <span
                  //onClick={() => setShowCollaborativeMapping(true)}
                  style={{
                    cursor: "pointer", color: "var(--text-secondary)", opacity: 0.3
                  }}
                >
                  Collaborative Mapping
                </span>
              </li>
              <li>
                <span
                  //onClick={() => setShowImpactTracking(true)}
                  style={{
                    cursor: "pointer", color: "var(--text-secondary)", opacity: 0.3
                  }}
                >
                  Impact Tracking
                </span>
              </li>
              <li>
                <span
                  //onClick={() => setShowReportVerification(true)}
                  style={{
                    cursor: "pointer", color: "var(--text-secondary)", opacity: 0.3
                  }}
                >
                  Report Verification
                </span>
              </li>
              <li>
                <span onClick={() => setRequestData(true)} style={{ cursor: "pointer", color: "var(--text-secondary)" }}>
                  Request Data / Info
                </span>
              </li>
              <li>
                <span onClick={() => setReportIssue(true)} style={{ cursor: "pointer", color: "var(--text-secondary)" }}>
                  Report an Issue
                </span>
              </li>
              <li>
                <Link 
                  //to="/research-study" 
                  style={{ color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  Research Study
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-h4">
              Resources
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <li>
                <Link
                  to="/aid-relief"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Aid Directory
                </Link>
              </li>
              <li>
                <span
                  onClick={() => setShowSafetyProtocols(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Safety Protocols
                </span>
              </li>
              <li>
                <Link
                  to="/first-aid-guides"
                  style={{ color: "var(--text-secondary)" }}
                >
                  First Aid Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/emergency-kits"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Emergency Kits
                </Link>
              </li>
              <li>
                <span
                  onClick={() => setShowTrainingPrograms(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Training Programs
                </span>
              </li>
              <li>
                <Link
                  to="/partner-organizations"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Trusted Organizations
                </Link>
              </li>
              <li>
                <Link
                  to="/emergency-contacts"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Emergency Contacts
                </Link>
              </li>
              <li>
                <Link
                  style={{ color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  A.E.G
                </Link>
              </li>
              <li>
                <span
                  //onClick={() => setFbi(true)}
                  style={{ cursor: 'pointer', color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  F.B.I Mode
                </span>
              </li>
              <li>
                <span
                  onClick={() => setSolution(true)}
                  style={{ cursor: 'pointer', color: "var(--text-secondary)" }}
                >
                  Solution Inventory
                </span>
              </li>
              <li>
                <span onClick={() => setSurvey(true)} style={{ cursor: 'pointer', color: "var(--text-secondary)" }}>
                  Growth Survey
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-h4">
              Community
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <li>
                <span
                  onClick={() => setFeatureRequest(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Feature Request
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowCommunityNotes(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Community Notes
                </span>
              </li>
              <li>
                <Link 
                  //to="/vent-space" 
                  style={{ color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  Vent Space
                </Link>
              </li>
              <li>
                <span
                  onClick={() => setShowAnonymousTips(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Anonymous Tips
                </span>
              </li>
              <li>
                <span
                  //onClick={() => setShowLocalNetworks(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  Local Networks
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowSupportGroups(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Support Groups
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowDiscussions(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Discussions
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowVotings(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Votings
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowEvacuationRoutes(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Evacuation Routes
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowSafeZones(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Safe Zones
                </span>
              </li>
              <li>
                <span
                  //onClick={() => setIdeaSwop(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  Idea Swop
                </span>
              </li>
              <li>
                <span
                  //onClick={() => setShowCollaborativeTips(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)", opacity: 0.3 }}
                >
                  Collaborative Tips
                </span>
              </li>
              <li>
                <Link to="/basic-support" style={{ color: "var(--text-secondary)" }}>
                  Support Basics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom"
        >
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            &copy; 2026{" "}
            <span style={{ color: "white", fontWeight: 600 }}>Innoxation Tech Inc</span>.
            All rights reserved.
          </p>
          <div
            style={{
              display: "flex",
              gap: "2rem",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            <Link to='/privacy-policy'>Privacy Policy</Link>
            <Link to='/terms-of-service'>Terms of Service</Link>
            <a
              onClick={() => setLanguage(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: 'pointer' }}
            >
              <FiGlobe /> English (US)
            </a>
            <a
              onClick={() => setShowSettings(true)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: 'pointer' }}
            >
              <FiSettings /> Settings
            </a>
          </div>
        </div>
      </div>

      {/* Popup Components */}
      <TelvinPopup
        isOpen={telvinChat}
        onClose={() => setTelvinChat(false)}
      />
      <OmniPopup
        isOpen={omniMode}
        onClose={() => setOmniMode(false)}
      />
      <UpvotePopup
        isOpen={upvote}
        onClose={() => setUpvote(false)}
      />
      <AuthenPopup
        isOpen={authen}
        onClose={() => setAuthen(false)}
      />
      <EvacuationRoutesPopup
        isOpen={showEvacuationRoutes}
        onClose={() => setShowEvacuationRoutes(false)}
      />
      <SafeZonesPopup
        isOpen={showSafeZones}
        onClose={() => setShowSafeZones(false)}
      />
      <SafetyProtocolsPopup
        isOpen={showSafetyProtocols}
        onClose={() => setShowSafetyProtocols(false)}
      />
      <TrainingProgramsPopup
        isOpen={showTrainingPrograms}
        onClose={() => setShowTrainingPrograms(false)}
      />
      <FeaturePopup
        isOpen={featureRequest}
        onClose={() => setFeatureRequest(false)}
      />
      <CommunityNotesPopup
        isOpen={showCommunityNotes}
        onClose={() => setShowCommunityNotes(false)}
      />
      <PredictionsPopup
        isOpen={showPredictions}
        onClose={() => setShowPredictions(false)}
      />
      <AnonymousTipsPopup
        isOpen={showAnonymousTips}
        onClose={() => setShowAnonymousTips(false)}
      />
      <LocalNetworksPopup
        isOpen={showLocalNetworks}
        onClose={() => setShowLocalNetworks(false)}
      />
      <SupportGroupsPopup
        isOpen={showSupportGroups}
        onClose={() => setShowSupportGroups(false)}
      />
      <DiscussionsPopup
        isOpen={showDiscussions}
        onClose={() => setShowDiscussions(false)}
      />
      <VotingsPopup
        isOpen={showVotings}
        onClose={() => setShowVotings(false)}
      />
      <ReportVerificationPopup
        isOpen={showReportVerification}
        onClose={() => setShowReportVerification(false)}
      />
      <ImpactTrackingPopup
        isOpen={showImpactTracking}
        onClose={() => setShowImpactTracking(false)}
      />
      <RequestDataPopup
        isOpen={requestData}
        onClose={() => setRequestData(false)}
      />
      <ReportIssuePopup
        isOpen={reportIssue}
        onClose={() => setReportIssue(false)}
      />
      <CollaborativeMappingPopup
        isOpen={showCollaborativeMapping}
        onClose={() => setShowCollaborativeMapping(false)}
      />
      <FBIPopup
        isOpen={fbi}
        onClose={() => setFbi(false)}
      />
      <SolutionPopup
        isOpen={solution}
        onClose={() => setSolution(false)}
      />
      <SurveyPopup
        isOpen={survey}
        onClose={() => setSurvey(false)}
      />
      <IdeaPopup
        isOpen={ideaSwop}
        onClose={() => setIdeaSwop(false)}
      />
      <CollaborativeTipsPopup
        isOpen={showCollaborativeTips}
        onClose={() => setShowCollaborativeTips(false)}
      />
      <LanguagePopup
        isOpen={language}
        onClose={() => setLanguage(false)}
      />
      <SettingsPopup
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </motion.footer>
  );
};

export default Footer;
