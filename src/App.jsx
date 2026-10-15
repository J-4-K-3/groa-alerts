import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_TRACKER_ID,
  IDs,
} from "./lib/Appwrite";
import Loading from "./components/Loading";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Documentation from "./pages/Documentation";
import MapPage from "./pages/MapPage";
import FullMap from "./pages/FullMap";
import Alerts from "./pages/Alerts";
import Compass from "./pages/Compass";
import Weather from "./pages/Weather";
import Plane from "./pages/PlaneTracking";
import Climate from "./pages/Climate";
import Regions from "./pages/Regions";
import Crises from "./pages/Crises";
import SubmitReport from "./pages/SubmitReport";
import News from "./pages/News";
import About from "./pages/About";
import ProjectLocal from "./pages/ProjectLocal";
import GiveData from "./pages/GiveData";
import Earn from "./pages/Earn";
import Research from "./pages/ResearchStudy";
import AidRelief from "./pages/AidRelief";
import EmergencyContacts from "./pages/EmergencyContacts";
import FirstAidGuides from "./pages/FirstAidGuides";
import EmergencyKits from "./pages/EmergencyKits";
import PartnerOrganizations from "./pages/PartnerOrganizations";
import Vent from "./pages/Vent";
import Support from "./pages/BasicSupport";
import Privacy from "./pages/PrivacyPolicy";
import Terms from "./pages/ToS";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = async () => {
    setLoading(false);

    try {
      const userAgent = navigator.userAgent;

      const osMatch = userAgent.match(
        /(Windows NT|Mac OS X|Linux|Android|iPhone|iPad)/i,
      );
      const os = osMatch
        ? osMatch[1].replace(/ NT$/, "").replace(/ OS X$/, "macOS")
        : "Unknown";

      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const referrer = document.referrer || "";
      const timestamp = new Date().toISOString();

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_TRACKER_ID,
        IDs.unique(),
        {
          userAgent,
          os,
          screenWidth,
          screenHeight,
          referrer,
          timestamp,
        },
      );
    } catch (error) {
      console.error("Visit tracking failed:", error);
    }
  };

  if (loading) {
    return <Loading onComplete={handleLoadingComplete} />;
  }

  return (
    <Router>
      <Helmet>
        <title>G.R.O.A</title>
        <meta
          name="description"
          content="Stay informed with verified global danger alerts."
        />
        <meta property="og:title" content="G.R.O.A" />
        <meta
          property="og:description"
          content="Stay informed with verified global danger alerts."
        />
        <meta
          property="og:image"
          content="https://gloa-alerts.vercel.app/assets/logo.svg"
        />
        <meta property="og:url" content="https://gloa-alerts.vercel.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="G.R.O.A" />
        <meta
          name="twitter:description"
          content="Stay informed with verified global danger alerts."
        />
        <meta
          name="twitter:image"
          content="https://gloa-alert.vercel.app/assets/logo.svg"
        />
      </Helmet>
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/full-map" element={<FullMap />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/compass" element={<Compass />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/plane-tracking" element={<Plane />} />
            <Route path="/climate-change" element={<Climate />} />
            <Route path="/regions" element={<Regions />} />
            <Route path="/crises" element={<Crises />} />
            <Route path="/submit-report" element={<SubmitReport />} />
            <Route path="/news" element={<News />} />
            <Route path="/about" element={<About />} />
            <Route path="/local" element={<ProjectLocal />}  />
            <Route path="/givedata" element={<GiveData />} />
            <Route path="/earn" element={<Earn />} />
            <Route path="/research-study" element={<Research />} />
            <Route path="/aid-relief" element={<AidRelief />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route path="/first-aid-guides" element={<FirstAidGuides />} />
            <Route path="/emergency-kits" element={<EmergencyKits />} />
            <Route
              path="/partner-organizations"
              element={<PartnerOrganizations />}
            />
            <Route path="/vent-space" element={<Vent />} />
            <Route path="/basic-support" element={<Support />} />
            <Route path="/privacy-policy" element={<Privacy />} />
            <Route path="/terms-of-service" element={<Terms />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
