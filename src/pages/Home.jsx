import { Link } from "react-router-dom";
import {
  FiAlertTriangle,
  FiShield,
  FiGlobe,
  FiClock,
  FiCheckCircle,
  FiChevronRight,
  FiCloud,
  FiZap,
  FiActivity,
} from "react-icons/fi";
import {
  RiBroadcastLine,
  RiAlarmWarningLine,
  RiMapPin2Line,
} from "react-icons/ri";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_ALERTS_ID,
  COLLECTION_CRISES_ID,
  COLLECTION_STATISTICS_ID,
  Query,
} from "../lib/Appwrite";
import {
  fetchAllAlertData,
  fetchReliefWebDisasters,
  fetchOpenMeteoCurrentWeather,
  fetchOpenMeteoWeatherAlerts,
  transformDisasterToCrisis,
  geocodeOpenMeteo,
} from "../lib/fetchApi";
import { motion } from "framer-motion";
import TelvinPopup from "../components/popups/TelvinPopup";

const Home = () => {
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [latestAlerts, setLatestAlerts] = useState([]);
  const [activeCrises, setActiveCrises] = useState([]);
  const [alertsWithCoords, setAlertsWithCoords] = useState([]); // Alerts with latitude/longitude for risk assessment
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [manualLocation, setManualLocation] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [coords, setCoords] = useState(null);
  const [riskCarouselIndex, setRiskCarouselIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [telvinPopupOpen, setTelvinPopupOpen] = useState(false);
  const [showDevNotice, setShowDevNotice] = useState(false);
  const [personalHealth, setPersonalHealth] = useState({
    conditions: [],
    medications: false,
    mobility: "full",
    allergies: [],
    lastCheckup: null,
    stressLevel: "moderate",
    sleepQuality: "good",
    hydration: "adequate",
  });
  const [healthCheckComplete, setHealthCheckComplete] = useState(false);

  // Enhanced state for all data sources
  const [allExternalData, setAllExternalData] = useState({
    earthquakes: [],
    conflicts: [],
    civilUnrest: [],
    weatherAlerts: [],
    naturalEvents: [],
    humanitarian: [],
  });
  const [localWeather, setLocalWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const hasLocationAssessment = Boolean(userLocation && coords);

  const healthCheck = useMemo(() => {
    if (!riskAssessment) {
      return null;
    }

    const scoreMap = {
      MINIMAL: 1,
      LOW: 2,
      ELEVATED: 3,
      HIGH: 4,
      CRITICAL: 5,
    };
    const riskScore = scoreMap[riskAssessment.level] || 0;
    const temperature = localWeather?.temperature ?? 22;
    const readiness =
      riskScore >= 4 ? "High" : riskScore >= 3 ? "Moderate" : "Good";
    const climateStatus =
      temperature > 30
        ? "Heat stress risk"
        : temperature < 5
          ? "Cold exposure risk"
          : "Climate conditions stable";

    return {
      readiness,
      climateStatus,
      hydration:
        temperature > 30
          ? "Increase hydration and cooling breaks"
          : temperature < 5
            ? "Prepare warm layers and shelter"
            : "Hydration and rest remain manageable",
      score: riskScore,
      note:
        riskScore >= 4
          ? "You should keep emergency plans close and avoid unnecessary exposure."
          : riskScore >= 3
            ? "Stay alert and keep emergency essentials ready."
            : "Your current conditions look manageable, but continued awareness is wise.",
    };
  }, [localWeather, riskAssessment]);

  const aiSummary = useMemo(() => {
    if (!riskAssessment || !userLocation) {
      return null;
    }

    return {
      headline: `${userLocation} is showing ${riskAssessment.level.toLowerCase()} risk conditions.`,
      body: `Safety is ${riskAssessment.level.toLowerCase()} with ${nearbyEvents.length || 0} nearby event signals and a ${healthCheck?.readiness.toLowerCase() || "stable"} health outlook.`,
      recommendation:
        riskAssessment.level === "CRITICAL"
          ? "Move to a secure shelter and contact local emergency services immediately."
          : riskAssessment.level === "HIGH"
            ? "Keep a ready-to-go safety plan and monitor the area closely."
            : riskAssessment.level === "ELEVATED"
              ? "Maintain awareness, prepare essentials, and check updates often."
              : "Stay prepared and keep monitoring regional developments.",
    };
  }, [healthCheck, nearbyEvents.length, riskAssessment, userLocation]);

  const changeRiskPanel = useCallback((direction) => {
    setRiskCarouselIndex((current) => {
      const nextIndex = current + direction;
      return Math.max(0, Math.min(nextIndex, 2));
    });
  }, []);

  const handlePersonalHealthChange = useCallback((field, value) => {
    setPersonalHealth((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleHealthConditionToggle = useCallback((condition) => {
    setPersonalHealth((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition],
    }));
  }, []);

  const handleAllergyToggle = useCallback((allergy) => {
    setPersonalHealth((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  }, []);

  const completeHealthCheck = useCallback(() => {
    setHealthCheckComplete(true);
  }, []);

  const resetHealthCheck = useCallback(() => {
    setPersonalHealth({
      conditions: [],
      medications: false,
      mobility: "full",
      allergies: [],
      lastCheckup: null,
      stressLevel: "moderate",
      sleepQuality: "good",
      hydration: "adequate",
    });
    setHealthCheckComplete(false);
  }, []);

  const getPersonalHealthGuidance = useMemo(() => {
    if (!healthCheckComplete) return null;

    const guidance = {
      riskLevel: "LOW",
      immediateActions: [],
      precautions: [],
      seekCare: false,
      whereToGo: "",
      whatToDo: [],
    };

    // Assess based on conditions
    const highRiskConditions = [
      "heart",
      "diabetes",
      "respiratory",
      "immune",
      "cancer",
      "stroke",
      "kidney",
      "liver",
    ];
    const hasHighRiskCondition = personalHealth.conditions.some((c) =>
      highRiskConditions.some((hrc) => c.toLowerCase().includes(hrc)),
    );

    // Assess mobility
    const mobilityRisk = personalHealth.mobility === "limited" ? 2 : personalHealth.mobility === "assisted" ? 3 : 0;

    // Assess medications
    const medicationRisk = personalHealth.medications ? 1 : 0;

    // Assess stress and sleep
    const stressRisk = personalHealth.stressLevel === "high" ? 2 : personalHealth.stressLevel === "moderate" ? 1 : 0;
    const sleepRisk = personalHealth.sleepQuality === "poor" ? 2 : personalHealth.sleepQuality === "fair" ? 1 : 0;

    // Assess hydration
    const hydrationRisk = personalHealth.hydration === "low" ? 2 : personalHealth.hydration === "moderate" ? 1 : 0;

    const totalRisk = mobilityRisk + medicationRisk + stressRisk + sleepRisk + hydrationRisk + (hasHighRiskCondition ? 3 : 0);

    if (totalRisk >= 6) {
      guidance.riskLevel = "HIGH";
      guidance.seekCare = true;
      guidance.whereToGo = "Nearest emergency department or urgent care clinic";
      guidance.immediateActions = [
        "Contact your healthcare provider immediately",
        "Ensure you have 7-day medication supply",
        "Have emergency contacts readily available",
        "Prepare a go-bag with medical documents",
      ];
      guidance.precautions = [
        "Avoid strenuous activity",
        "Monitor symptoms closely",
        "Stay in climate-controlled environment",
        "Keep communication device charged",
      ];
    } else if (totalRisk >= 3) {
      guidance.riskLevel = "MODERATE";
      guidance.seekCare = false;
      guidance.whereToGo = "Primary care provider or telehealth consultation";
      guidance.immediateActions = [
        "Schedule check-up within 1 week",
        "Refill prescriptions early",
        "Set medication reminders",
        "Track symptoms daily",
      ];
      guidance.precautions = [
        "Maintain regular medication schedule",
        "Prioritize sleep and stress management",
        "Stay hydrated and eat balanced meals",
        "Limit exposure to extreme temperatures",
      ];
    } else {
      guidance.riskLevel = "LOW";
      guidance.seekCare = false;
      guidance.whereToGo = "Routine care with primary provider";
      guidance.immediateActions = [
        "Continue current health routines",
        "Annual wellness check recommended",
        "Stay up to date on vaccinations",
      ];
      guidance.precautions = [
        "Maintain healthy lifestyle",
        "Regular exercise as able",
        "Balanced nutrition",
        "Adequate sleep (7-9 hours)",
      ];
    }

    // Add condition-specific guidance
    if (personalHealth.conditions.length > 0) {
      guidance.whatToDo.push(
        `Manage ${personalHealth.conditions.join(", ")} with regular monitoring`,
      );
    }
    if (personalHealth.medications) {
      guidance.whatToDo.push("Take medications exactly as prescribed");
    }
    if (personalHealth.mobility !== "full") {
      guidance.whatToDo.push("Plan for mobility needs during emergencies");
      guidance.whereToGo += " (ensure accessibility)";
    }
    if (personalHealth.allergies.length > 0) {
      guidance.whatToDo.push(
        `Carry allergy medication (${personalHealth.allergies.join(", ")})`,
      );
      guidance.precautions.push("Wear medical alert identification");
    }

    return guidance;
  }, [personalHealth, healthCheckComplete]);

  const getAiActionPlan = useMemo(() => {
    if (!riskAssessment || !userLocation) return [];

    const actions = [];
    const riskLevel = riskAssessment.level;

    // Base actions by risk level
    if (riskLevel === "CRITICAL") {
      actions.push(
        "Move to safe shelter immediately",
        "Contact emergency services (911/112)",
        "Activate emergency contacts",
        "Grab go-bag with essentials",
      );
    } else if (riskLevel === "HIGH") {
      actions.push(
        "Review and prepare evacuation routes",
        "Pack emergency kit (water, meds, documents)",
        "Charge all devices and power banks",
        "Monitor official alerts continuously",
      );
    } else if (riskLevel === "ELEVATED") {
      actions.push(
        "Check emergency supplies and restock",
        "Identify nearest shelters and hospitals",
        "Set up alert notifications",
        "Discuss family emergency plan",
      );
    } else {
      actions.push(
        "Stay informed via trusted sources",
        "Maintain basic preparedness kit",
        "Review insurance coverage",
        "Know your community resources",
      );
    }

    // Add health-specific actions if health check complete
    if (healthCheckComplete && getPersonalHealthGuidance) {
      actions.push(...getPersonalHealthGuidance.immediateActions.slice(0, 2));
    }

    // Add weather-specific actions
    if (localWeather) {
      if (localWeather.temperature > 35) actions.push("Limit outdoor exposure during peak heat");
      if (localWeather.temperature < 0) actions.push("Protect against cold exposure");
      if (localWeather.windSpeed > 15) actions.push("Secure loose outdoor items");
      if (localWeather.precipitation > 5) actions.push("Prepare for potential flooding");
    }

    return actions.slice(0, 6);
  }, [riskAssessment, userLocation, healthCheckComplete, getPersonalHealthGuidance, localWeather]);

  const getAiWhereToGo = useMemo(() => {
    if (!riskAssessment || !userLocation) return [];

    const places = [];
    const riskLevel = riskAssessment.level;

    if (riskLevel === "CRITICAL") {
      places.push(
        "Nearest emergency shelter or community center",
        "Hospital emergency department",
        "Local emergency management office",
      );
    } else if (riskLevel === "HIGH") {
      places.push(
        "Designated evacuation center (check local gov website)",
        "Urgent care clinic for medical needs",
        "Community emergency hub",
      );
    } else if (riskLevel === "ELEVATED") {
      places.push(
        "Local government emergency info page",
        "Nearest pharmacy for supplies",
        "Community center for updates",
      );
    } else {
      places.push(
        "City/county emergency management website",
        "Ready.gov or FEMA app for planning",
        "Local Red Cross chapter",
      );
    }

    // Add health-specific places
    if (healthCheckComplete && getPersonalHealthGuidance) {
      if (getPersonalHealthGuidance.seekCare) {
        places.unshift("Emergency department or urgent care");
      } else {
        places.unshift(getPersonalHealthGuidance.whereToGo);
      }
    }

    return [...new Set(places)].slice(0, 5);
  }, [riskAssessment, userLocation, healthCheckComplete, getPersonalHealthGuidance]);

  const handleTouchStart = useCallback((event) => {
    setTouchStartX(event.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (event) => {
      if (touchStartX === null) return;

      const touchEndX = event.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          changeRiskPanel(1);
        } else {
          changeRiskPanel(-1);
        }
      }

      setTouchStartX(null);
    },
    [changeRiskPanel, touchStartX],
  );

  const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Haversine formula to calculate great-circle distance between two points
  const haversineDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Calculate risk assessment based on location and current crises/alerts
  // NOW USES ALL DATA from fetchApi.js - earthquakes, conflicts, weather, natural events, humanitarian
  const calculateRisk = useCallback(
    (
      latitude,
      longitude,
      locationData,
      activeCrises,
      alertsWithCoords,
      externalData = {},
      localWeather = null,
    ) => {
      // Combine ALL events from ALL sources
      const allEvents = [
        // Internal crises
        ...activeCrises.map((c) => ({
          ...c,
          type: "crisis",
          severity: c.severity || 3,
          category: "humanitarian",
        })),
        // External alerts with coordinates
        ...alertsWithCoords.map((a) => ({ ...a, type: "alert" })),
        // Earthquakes from USGS
        ...(externalData.earthquakes || []).map((e) => ({
          ...e,
          type: "earthquake",
          category: "natural",
          severity:
            e.magnitude >= 7
              ? 1
              : e.magnitude >= 6
                ? 2
                : e.magnitude >= 5
                  ? 3
                  : 4,
        })),
        // Conflicts/War from HDX
        ...(externalData.conflicts || []).map((c) => ({
          ...c,
          type: "conflict",
          category: "war",
          severity: 1,
        })),
        // Civil Unrest
        ...(externalData.civilUnrest || []).map((c) => ({
          ...c,
          type: "civilUnrest",
          category: "security",
          severity: 2,
        })),
        // Weather Alerts from GDACS/Open-Meteo
        ...(externalData.weatherAlerts || []).map((w) => ({
          ...w,
          type: "weather",
          category: "weather",
          severity:
            w.severity === "critical" ? 1 : w.severity === "high" ? 2 : 3,
        })),
        // Natural Events from EONET
        ...(externalData.naturalEvents || []).map((n) => ({
          ...n,
          type: "naturalEvent",
          category: "natural",
          severity: n.severity === "High" ? 2 : n.severity === "Medium" ? 3 : 4,
        })),
        // Humanitarian from HDX
        ...(externalData.humanitarian || []).map((h) => ({
          ...h,
          type: "humanitarian",
          category: "humanitarian",
          severity: 2,
        })),
      ];

      // Calculate distance for each event
      const eventsWithDistance = allEvents
        .filter((event) => event.latitude && event.longitude)
        .map((event) => ({
          ...event,
          distance: haversineDistance(
            latitude,
            longitude,
            event.latitude || 0,
            event.longitude || 0,
          ),
        }))
        .sort((a, b) => a.distance - b.distance);

      // Categorize by distance
      const immediateThreats = eventsWithDistance.filter(
        (e) => e.distance < 150,
      );
      const nearbyThreats = eventsWithDistance.filter(
        (e) => e.distance >= 150 && e.distance < 500,
      );
      const regionalThreats = eventsWithDistance.filter(
        (e) => e.distance >= 500 && e.distance < 1000,
      );

      // Update nearby events display
      setNearbyEvents(eventsWithDistance.slice(0, 3));

      // Calculate weather-based risk
      let weatherRisk = 0;
      if (localWeather) {
        if (localWeather.temperature > 40 || localWeather.temperature < -10)
          weatherRisk = 2;
        else if (localWeather.temperature > 35 || localWeather.temperature < 0)
          weatherRisk = 1;
        if (localWeather.windSpeed > 20) weatherRisk = Math.max(weatherRisk, 2);
        if (localWeather.precipitation > 10)
          weatherRisk = Math.max(weatherRisk, 1);
      }

      // Determine risk level
      const criticalEvents = immediateThreats.filter(
        (e) =>
          (e.type === "earthquake" && e.magnitude >= 6) ||
          e.type === "conflict" ||
          e.severity === 1,
      );

      let riskLevel, message, color, bgColor, borderColor, note, advice;

      if (
        criticalEvents.length > 0 ||
        (immediateThreats.length > 0 && weatherRisk >= 2)
      ) {
        const worstEvent = criticalEvents[0] || immediateThreats[0];
        riskLevel = "CRITICAL";
        color = "#ef4444";
        bgColor = "rgba(239, 68, 68, 0.15)";
        borderColor = "rgba(239, 68, 68, 0.4)";
        const eventType =
          worstEvent.type === "earthquake"
            ? "earthquake"
            : worstEvent.type === "conflict"
              ? "conflict zone"
              : "natural disaster";
        message = `CRITICAL: ${worstEvent.title} is within ${Math.round(worstEvent.distance)}km!`;
        note = `You are in immediate proximity to a ${eventType}. This requires immediate attention.`;
        advice = [
          {
            text: "Seek Safe Shelter",
            color: "#ef4444",
            bg: "rgba(239, 68, 68, 0.3)",
          },
          {
            text: "Monitor Emergency Broadcasts",
            color: "#f59e0b",
            bg: "rgba(245, 158, 11, 0.3)",
          },
          {
            text: "Prepare Emergency Kit",
            color: "#3b82f6",
            bg: "rgba(59, 130, 246, 0.3)",
          },
        ];
      } else if (immediateThreats.length > 0) {
        const worstEvent = immediateThreats[0];
        riskLevel = "HIGH";
        color = "#f97316";
        bgColor = "rgba(249, 115, 22, 0.15)";
        borderColor = "rgba(249, 115, 22, 0.4)";
        message = `HIGH ALERT: ${worstEvent.title} reported ${Math.round(worstEvent.distance)}km away.`;
        note = "There are active threats in your immediate area. Stay alert.";
        advice = [
          {
            text: "Stay Alert",
            color: "#f97316",
            bg: "rgba(249, 115, 22, 0.3)",
          },
          {
            text: "Review Evacuation Routes",
            color: "#f59e0b",
            bg: "rgba(245, 158, 11, 0.3)",
          },
        ];
      } else if (nearbyThreats.length > 0 || weatherRisk >= 1) {
        riskLevel = "ELEVATED";
        color = "#f59e0b";
        bgColor = "rgba(245, 158, 11, 0.12)";
        borderColor = "rgba(245, 158, 11, 0.35)";
        message =
          nearbyThreats.length > 0
            ? `CAUTION: ${nearbyThreats[0].title} reported ${Math.round(nearbyThreats[0].distance)}km away.`
            : "Weather advisory in effect for your area.";
        note = "There are active situations in your broader region.";
        advice = [
          {
            text: "Stay Informed",
            color: "#f59e0b",
            bg: "rgba(245, 158, 11, 0.25)",
          },
          {
            text: "Check Emergency Supplies",
            color: "#10b981",
            bg: "rgba(16, 185, 129, 0.25)",
          },
        ];
      } else if (regionalThreats.length > 0) {
        riskLevel = "LOW";
        color = "#22c55e";
        bgColor = "rgba(34, 197, 94, 0.1)";
        borderColor = "rgba(34, 197, 94, 0.3)";
        message = `${regionalThreats.length} event(s) detected within 1000km.`;
        note = "Your area is relatively safe with events in broader region.";
        advice = [
          {
            text: "Monitor Regional News",
            color: "#3b82f6",
            bg: "rgba(59, 130, 246, 0.2)",
          },
          {
            text: "General Preparedness",
            color: "#10b981",
            bg: "rgba(16, 185, 129, 0.2)",
          },
        ];
      } else {
        riskLevel = "MINIMAL";
        color = "#10b981";
        bgColor = "rgba(16, 185, 129, 0.1)";
        borderColor = "rgba(16, 185, 129, 0.3)";
        message = "No significant threats detected in your vicinity.";
        note = "Your location appears safe. Continue monitoring global trends.";
        advice = [
          {
            text: "Stay Aware",
            color: "#3b82f6",
            bg: "rgba(59, 130, 246, 0.2)",
          },
          {
            text: "Maintain Readiness",
            color: "#10b981",
            bg: "rgba(16, 185, 129, 0.2)",
          },
        ];
      }

      return {
        level: riskLevel,
        message,
        color,
        bgColor,
        borderColor,
        note,
        advice,
        weatherInfo: localWeather
          ? {
            temp: localWeather.temperature,
            condition: localWeather.weather || localWeather.description,
            wind: localWeather.windSpeed,
            humidity: localWeather.humidity,
          }
          : null,
        stats: {
          immediate: immediateThreats.length,
          nearby: nearbyThreats.length,
          regional: regionalThreats.length,
          total: eventsWithDistance.length,
        },
      };
    },
    [haversineDistance],
  );

  const handleManualLocationSearch = async (e) => {
    if (e) e.preventDefault();
    if (!manualLocation.trim()) return;

    setIsSearchingLocation(true);
    setLocationError(null);

    try {
      // Use Open-Meteo geocoding (no API key needed)
      const geoResult = await geocodeOpenMeteo(manualLocation);

      if (geoResult) {
        const { latitude, longitude, name, country, countryCode } = geoResult;
        setCoords({ latitude, longitude });
        setUserLocation(`${name}, ${country}`);

        // Fetch local weather
        try {
          const weather = await fetchOpenMeteoCurrentWeather(
            latitude,
            longitude,
          );
          setLocalWeather(weather);
        } catch (weatherErr) {
          console.warn("Failed to fetch weather:", weatherErr);
        }

        const locationData = {
          countryName: country,
          continent: getContinentFromLatitude(latitude),
        };
        setRiskAssessment(
          calculateRisk(
            latitude,
            longitude,
            locationData,
            activeCrises,
            alertsWithCoords,
            allExternalData,
            localWeather,
          ),
        );
      } else {
        // Fallback to OpenWeatherMap
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(manualLocation)}&limit=1&appid=${OPENWEATHER_API_KEY}`,
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const { lat, lon, name, country, state } = data[0];
          const latitude = lat;
          const longitude = lon;
          setCoords({ latitude, longitude });
          setUserLocation(`${name}${state ? `, ${state}` : ""}, ${country}`);

          // Fetch local weather
          try {
            const weather = await fetchOpenMeteoCurrentWeather(
              latitude,
              longitude,
            );
            setLocalWeather(weather);
          } catch (weatherErr) {
            console.warn("Failed to fetch weather:", weatherErr);
          }

          const locationData = {
            countryName: country,
            continent: getContinentFromLatitude(latitude),
          };
          setRiskAssessment(
            calculateRisk(
              latitude,
              longitude,
              locationData,
              activeCrises,
              alertsWithCoords,
              allExternalData,
              localWeather,
            ),
          );
        } else {
          setLocationError("Location not found. Try a city or country name.");
        }
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setLocationError("Unable to find that location. Please try again.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Estimate continent from latitude (rough approximation when geocoding fails)
  const getContinentFromLatitude = (latitude) => {
    if (latitude >= 66.5) return "Arctic";
    if (latitude >= 23.5) return "North America";
    if (latitude >= 0) return "Africa"; // Includes Africa, Middle East, parts of Asia
    if (latitude >= -23.5) return "Africa"; // Southern Africa
    if (latitude >= -66.5) return "Antarctica";
    return "Antarctica";
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Fetch data from multiple sources concurrently
        const [
          appwriteAlerts,
          appwriteCrises,
          appwriteStats,
          externalAlerts,
          externalCrises,
        ] = await Promise.allSettled([
          // Internal alerts
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ALERTS_ID, [
            Query.equal("active", true),
            Query.orderDesc("$createdAt"),
            Query.limit(3),
          ]),
          // Internal crises
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_CRISES_ID, [
            Query.orderDesc("severity"),
          ]),
          // Internal statistics
          databases.listDocuments(
            APPWRITE_DATABASE_ID,
            COLLECTION_STATISTICS_ID,
          ),
          // External alerts (earthquakes and weather)
          fetchAllAlertData(),
          // External crises (ReliefWeb disasters)
          fetchReliefWebDisasters({ limit: 10, status: "current" }),
        ]);

        // Process internal alerts
        let alertsData = [];
        if (appwriteAlerts.status === "fulfilled") {
          alertsData = appwriteAlerts.value.documents.map((alert) => ({
            id: alert.$id,
            level: alert.level,
            title: alert.title,
            location: alert.location,
            time: getTimeAgo(alert.$createdAt),
            verified: alert.verified,
            source: "internal",
          }));
        }

        // Process external alerts - store all data for risk assessment
        if (externalAlerts.status === "fulfilled") {
          // Store alerts with coordinates for risk assessment
          const alertsWithCoordsData = externalAlerts.value
            .filter((alert) => alert.latitude && alert.longitude)
            .map((alert) => ({
              id: alert.id,
              title: alert.title,
              level: alert.level,
              location: alert.location,
              latitude: alert.latitude,
              longitude: alert.longitude,
              time: getTimeAgo(alert.time || alert.createdAt),
              verified: true,
              source: "external",
            }));
          setAlertsWithCoords(alertsWithCoordsData);

          // Categorize all external data for smart risk assessment
          const earthquakes = externalAlerts.value
            .filter(
              (a) => a.type === "earthquake" || a.category === "earthquake",
            )
            .map((e) => ({
              ...e,
              latitude: e.latitude || 0,
              longitude: e.longitude || 0,
            }));

          const weatherAlerts = externalAlerts.value
            .filter((a) => a.type === "weather" || a.category === "weather")
            .map((w) => ({
              ...w,
              latitude: w.latitude || 0,
              longitude: w.longitude || 0,
            }));

          setAllExternalData((prev) => ({
            ...prev,
            earthquakes,
            weatherAlerts,
          }));

          // Also get latest alerts for display
          const externalAlertsData = externalAlerts.value
            .filter((alert) => alert.active !== false)
            .slice(0, 3)
            .map((alert) => ({
              id: alert.id,
              level: alert.level,
              title: alert.title,
              location: alert.location,
              time: getTimeAgo(alert.time || alert.createdAt),
              verified: true,
              source: "external",
            }));
          alertsData = [...alertsData, ...externalAlertsData];
        }

        // Sort combined alerts by time and take top 3
        alertsData.sort((a, b) => {
          const timeA = new Date(a.time === "Just now" ? Date.now() : a.time);
          const timeB = new Date(b.time === "Just now" ? Date.now() : b.time);
          return timeB - timeA;
        });
        setLatestAlerts(alertsData.slice(0, 3));

        // Store alerts with coordinates for risk assessment (from external sources like USGS earthquakes)
        if (externalAlerts.status === "fulfilled") {
          const alertsWithCoordsData = externalAlerts.value
            .filter((alert) => alert.latitude && alert.longitude)
            .map((alert) => ({
              id: alert.id,
              title: alert.title,
              level: alert.level,
              location: alert.location,
              latitude: alert.latitude,
              longitude: alert.longitude,
              time: getTimeAgo(alert.time || alert.createdAt),
              verified: true,
              source: "external",
            }));
          setAlertsWithCoords(alertsWithCoordsData);
        }

        // Process internal crises
        let crisesData = [];
        if (appwriteCrises.status === "fulfilled") {
          console.log("Fetched crises:", appwriteCrises.value.documents);
          crisesData = appwriteCrises.value.documents.map((crisis) => ({
            id: crisis.$id,
            title: crisis.title,
            impact: crisis.impact,
            severity: crisis.severity,
            region: crisis.region,
            source: "internal",
          }));
          console.log("Processed crises:", crisesData);
        } else {
          console.log("Crises fetch failed:", appwriteCrises.reason);
        }

        // Process external crises
        if (externalCrises.status === "fulfilled") {
          const externalCrisesData = externalCrises.value
            .slice(0, 5) // Limit external crises
            .map((disaster) => {
              const crisis = transformDisasterToCrisis(disaster);
              return {
                id: crisis.id,
                title: crisis.title,
                impact: crisis.impact,
                severity: crisis.severity,
                region: crisis.region || "Global",
                source: "external",
              };
            });
          crisesData = [...crisesData, ...externalCrisesData];
        }

        setActiveCrises(crisesData);

        // Process statistics
        if (appwriteStats.status === "fulfilled") {
          const statsData = appwriteStats.value.documents.map((stat) => ({
            label: stat.label,
            value: stat.value,
            icon: getStatIcon(stat.key),
          }));
          setStats(statsData);
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // One-time development notice
  useEffect(() => {
    const dismissed = localStorage.getItem("groa-dev-notice-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShowDevNotice(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Get user location and calculate risk assessment
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser");
        return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        });

        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        // Fetch local weather using Open-Meteo
        try {
          const weather = await fetchOpenMeteoCurrentWeather(
            latitude,
            longitude,
          );
          setLocalWeather(weather);
        } catch (weatherErr) {
          console.warn("Failed to fetch local weather:", weatherErr);
        }

        // Reverse geocode to get location name
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const locationData = await response.json();

          const locationName = `${locationData.city || locationData.locality || "Unknown City"}, ${locationData.countryName || "Unknown Country"}`;
          setUserLocation(locationName);

          setRiskAssessment(
            calculateRisk(
              latitude,
              longitude,
              locationData,
              activeCrises,
              alertsWithCoords,
              allExternalData,
              localWeather,
            ),
          );
        } catch (geocodeError) {
          console.error("Error reverse geocoding:", geocodeError);
          const locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setUserLocation(locationName);

          const locationData = {
            countryName: null,
            continent: getContinentFromLatitude(latitude),
          };

          setRiskAssessment(
            calculateRisk(
              latitude,
              longitude,
              locationData,
              activeCrises,
              alertsWithCoords,
              allExternalData,
              localWeather,
            ),
          );
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setLocationError(
          "Unable to access your location. Please enable location services or type manually.",
        );
        setRiskAssessment({
          level: "UNKNOWN",
          color: "#6b7280",
          bgColor: "rgba(107, 114, 128, 0.1)",
          borderColor: "rgba(107, 114, 128, 0.3)",
        });
      }
    };

    if (!coords) {
      getUserLocation();
    }
  }, [
    activeCrises,
    alertsWithCoords,
    coords,
    calculateRisk,
    allExternalData,
    localWeather,
  ]);

  // Helper function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  // Helper function to get stat icons
  const getStatIcon = (key) => {
    switch (key) {
      case "active_alerts":
        return <RiAlarmWarningLine />;
      case "verified_sources":
        return <FiCheckCircle />;
      case "monitored_regions":
        return <FiGlobe />;
      default:
        return <FiCheckCircle />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div
        style={{
          paddingTop: "140px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          paddingTop: "140px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <div style={{ color: "red" }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="home-page" style={{ paddingTop: '140px', paddingBottom: '40px' }}>
      {/* Hero Section */}
      <section
        className="hero"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <motion.div variants={itemVariants} style={{ maxWidth: "800px" }}>
            <span
              style={{
                color: "var(--accent-color)",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontSize: "0.9rem",
                display: "block",
                marginBottom: "1rem",
              }}
            >
              Global Situational Awareness
            </span>
            <h1
              className="text-gradient"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                marginBottom: "1.5rem",
                lineHeight: 1.1,
              }}
            >
              Real-time Awareness for a{" "}
              <span style={{ color: "white" }}>Safer World</span>
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--text-secondary)",
                marginBottom: "2.5rem",
                maxWidth: "600px",
              }}
            >
              Stay ahead of global risks with verified, AI-assisted alerts and
              real-time situational reporting from across the globe.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: 50,
              }}
            >
              <Link
              //to="/docs"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  style={{
                    background: "white",
                    color: "black",
                    border: "none",
                    opacity: 0.3
                  }}
                >
                  View Documentation
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                //onClick={() => setShowSOSModal(true)}
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                  color: "white",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 600,
                  opacity: 0.3
                }}
              >
                SOS Request
              </motion.button>
              <Link to="/about">
                <motion.button whileHover={{ scale: 1.05 }} className="glass">
                  How it Works
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Hero Background Elements */}
        <div
          style={{
            position: "absolute",
            right: "-10%",
            top: "10%",
            width: "60%",
            height: "80%",
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />
      </section>

      <div className="container">
        {/* Personal Risk Radar */}
        <motion.div
          variants={itemVariants}
          className="card glass personal-assessment-responsive"
          style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)",
            border: "1px solid var(--border-color)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30%",
              right: "-10%",
              width: "120px",
              height: "120px",
              background:
                "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
              opacity: 0.08,
              filter: "blur(30px)",
            }}
          />

          <div className="risk-radar-header">
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
                Personal Risk Radar
              </h2>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Safety, health, and AI guidance for your current location
              </p>
            </div>
            <form
              onSubmit={handleManualLocationSearch}
              className="location-form"
              style={{ marginTop: 15 }}
            >
              <input
                type="text"
                placeholder="Enter a local area, city or country..."
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "0.85rem",
                  padding: "0.2rem 0.5rem",
                  outline: "none",
                  width: "180px",
                }}
              />
              <button
                type="submit"
                disabled={isSearchingLocation}
                style={{
                  padding: "0.3rem 0.7rem",
                  fontSize: "0.75rem",
                  background: "var(--accent-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.3rem",
                  cursor: "pointer",
                  opacity: isSearchingLocation ? 0.5 : 1,
                }}
              >
                {isSearchingLocation ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          <div
            className="risk-radar-carousel"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              overflow: "hidden",
              width: "100%",
              position: "relative",
              minHeight: "320px",
            }}
          >
            <div
              className="risk-radar-track"
              style={{
                display: "flex",
                width: "100%",
                transform: `translateX(-${riskCarouselIndex * 100}%)`,
                transition: "transform 0.3s ease-out",
                willChange: "transform",
                minHeight: "320px",
              }}
            >
              <div
                className="risk-radar-slide"
                style={{ flex: "0 0 100%", width: "100%", padding: "0 0.5rem", boxSizing: "border-box", minHeight: "320px" }}
              >
                <div className="risk-radar-panel-header">
                  <h3 style={{ marginTop: 10 }}>Safety Assessment</h3>
                </div>
                {hasLocationAssessment ? (
                  <>
                    <div className="grid location-level-grid">
                      <div
                        style={{
                          padding: "1rem",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: "0.75rem",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <h3
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            marginBottom: "0.25rem",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Location
                        </h3>
                        <p style={{ fontSize: "1rem", fontWeight: 600 }}>
                          {userLocation ||
                            (locationError
                              ? "Location unavailable"
                              : "Detecting location...")}
                        </p>
                        {locationError && (
                          <p
                            style={{
                              color: "#ef4444",
                              fontSize: "0.7rem",
                              marginTop: "0.25rem",
                            }}
                          >
                            {locationError}
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          padding: "1rem",
                          background:
                            riskAssessment?.bgColor || "rgba(16, 185, 129, 0.1)",
                          borderRadius: "0.75rem",
                          border: `1px solid ${riskAssessment?.borderColor || "rgba(16, 185, 129, 0.3)"}`,
                        }}
                      >
                        <h3
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            marginBottom: "0.25rem",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          Risk Level
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "1rem",
                              fontWeight: 600,
                              color: riskAssessment?.color || "#10b981",
                            }}
                          >
                            {riskAssessment?.level || "UNKNOWN"}
                          </span>
                          <span
                            style={{
                              padding: "0.2rem 0.6rem",
                              background:
                                riskAssessment?.bgColor || "rgba(16, 185, 129, 0.2)",
                              borderRadius: "0.75rem",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              color: riskAssessment?.color || "#10b981",
                            }}
                          >
                            {riskAssessment?.message || "Assessing..."}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                      <h3
                        style={{
                          marginBottom: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "1rem",
                        }}
                      >
                        Nearby Events
                      </h3>
                      <div className="nearby-events">
                        {nearbyEvents.length > 0 ? (
                          nearbyEvents.map((event, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "0.75rem",
                                background: "rgba(255,255,255,0.02)",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--border-color)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                                marginBottom: 10,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <div
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background:
                                      event.type === "crisis"
                                        ? "var(--alert-high)"
                                        : "var(--alert-medium)",
                                  }}
                                />
                                <span style={{ fontSize: "0.9rem" }}>
                                  {event.title}
                                </span>
                              </div>
                              <span
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {Math.round(event.distance)} km away
                              </span>
                            </div>
                          ))
                        ) : (
                          <p
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.85rem",
                              padding: "0.75rem",
                            }}
                          >
                            No significant events detected within 1000km.
                          </p>
                        )}
                      </div>
                    </div>

                    {localWeather && (
                      <div style={{ marginBottom: "1.5rem" }}>
                        <h3
                          style={{
                            marginBottom: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "1rem",
                          }}
                        >
                          <FiCloud style={{ color: "var(--accent-color)" }} />
                          Local Weather
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            flexWrap: "wrap",
                            padding: "1rem",
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: "0.75rem",
                            border: "1px solid var(--border-color)",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <p
                              style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                color: "var(--accent-color)",
                              }}
                            >
                              {Math.round(localWeather.temperature)}°C
                            </p>
                            <p
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {localWeather.description || localWeather.weather}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "1.5rem",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <FiCloud
                                style={{ color: "#3b82f6", marginRight: "0.3rem" }}
                              />
                              <span style={{ fontSize: "0.85rem" }}>
                                Humidity: {localWeather.humidity}%
                              </span>
                            </div>
                            <div>
                              <FiZap
                                style={{ color: "#f59e0b", marginRight: "0.3rem" }}
                              />
                              <span style={{ fontSize: "0.85rem" }}>
                                Wind: {localWeather.windSpeed} m/s
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        padding: "1rem",
                        background:
                          riskAssessment?.bgColor ||
                          "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)",
                        borderRadius: "0.75rem",
                        border: `1px solid ${riskAssessment?.borderColor || "rgba(59, 130, 246, 0.3)"}`,
                      }}
                    >
                      <h3
                        style={{
                          marginBottom: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.95rem",
                        }}
                      >
                        Assessment Note
                      </h3>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          marginBottom: "0.75rem",
                          fontSize: "0.85rem",
                        }}
                      >
                        {riskAssessment?.note ||
                          "Awaiting location data to provide a detailed safety assessment."}
                      </p>

                      <h3
                        style={{
                          marginBottom: "0.5rem",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        Recommended Awareness
                      </h3>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        {riskAssessment?.advice ? (
                          riskAssessment.advice.map((item, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: "0.3rem 0.6rem",
                                background: item.bg,
                                borderRadius: "0.4rem",
                                fontSize: "0.7rem",
                                fontWeight: 500,
                                color: item.color,
                              }}
                            >
                              {item.text}
                            </span>
                          ))
                        ) : (
                          <span
                            style={{
                              padding: "0.3rem 0.6rem",
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: "0.4rem",
                              fontSize: "0.7rem",
                              fontWeight: 500,
                              color: "var(--text-secondary)",
                            }}
                          >
                            No specific recommendations
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="risk-radar-placeholder">
                    Search a country or city for safety assessment.
                  </div>
                )}
              </div>

              <div
                className="risk-radar-slide"
                style={{ flex: "0 0 100%", width: "100%", padding: "0 0.5rem", boxSizing: "border-box", minHeight: "320px" }}
              >
                <div className="risk-radar-panel-header">
                  <h3 style={{ marginTop: 10 }}>Health Check</h3>
                </div>
                {hasLocationAssessment ? (
                  !healthCheckComplete ? (
                    <div className="personal-health-form">
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                        Tell us about your health to get personalized safety guidance. This stays on your device.
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                            Health Conditions
                          </label>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {["Heart Condition", "Diabetes", "Respiratory (Asthma/COPD)", "Immune Disorder", "Cancer", "Stroke History", "Kidney Disease", "Liver Disease", "High Blood Pressure", "None"].map((condition) => (
                              <button
                                key={condition}
                                type="button"
                                onClick={() => condition !== "None" ? handleHealthConditionToggle(condition) : handlePersonalHealthChange("conditions", personalHealth.conditions.includes("None") ? [] : ["None"])}
                                style={{
                                  padding: "0.4rem 0.75rem",
                                  borderRadius: "0.5rem",
                                  border: "1px solid",
                                  background: personalHealth.conditions.includes(condition) ? "var(--accent-color)" : "rgba(255,255,255,0.05)",
                                  color: personalHealth.conditions.includes(condition) ? "white" : "var(--text-secondary)",
                                  borderColor: personalHealth.conditions.includes(condition) ? "var(--accent-color)" : "var(--border-color)",
                                  fontSize: "0.7rem",
                                  cursor: "pointer",
                                }}
                              >
                                {condition}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                            On Regular Medications?
                          </label>
                          <div style={{ display: "flex", gap: "1rem" }}>
                            {["Yes", "No"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handlePersonalHealthChange("medications", opt === "Yes")}
                                style={{
                                  padding: "0.5rem 1rem",
                                  borderRadius: "0.5rem",
                                  border: "1px solid",
                                  background: personalHealth.medications === (opt === "Yes") ? "var(--accent-color)" : "rgba(255,255,255,0.05)",
                                  color: personalHealth.medications === (opt === "Yes") ? "white" : "var(--text-secondary)",
                                  borderColor: personalHealth.medications === (opt === "Yes") ? "var(--accent-color)" : "var(--border-color)",
                                  fontSize: "0.8rem",
                                  cursor: "pointer",
                                }}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                            Mobility Level
                          </label>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {[
                              { value: "full", label: "Full Mobility" },
                              { value: "limited", label: "Limited Mobility" },
                              { value: "assisted", label: "Need Assistance" },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handlePersonalHealthChange("mobility", opt.value)}
                                style={{
                                  padding: "0.5rem 1rem",
                                  borderRadius: "0.5rem",
                                  border: "1px solid",
                                  background: personalHealth.mobility === opt.value ? "var(--accent-color)" : "rgba(255,255,255,0.05)",
                                  color: personalHealth.mobility === opt.value ? "white" : "var(--text-secondary)",
                                  borderColor: personalHealth.mobility === opt.value ? "var(--accent-color)" : "var(--border-color)",
                                  fontSize: "0.8rem",
                                  cursor: "pointer",
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                            Allergies (Severe)
                          </label>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {["Penicillin", "Sulfa Drugs", "NSAIDs", "Latex", "Insect Stings", "Food (Nuts/Shellfish)", "None"].map((allergy) => (
                              <button
                                key={allergy}
                                type="button"
                                onClick={() => allergy !== "None" ? handleAllergyToggle(allergy) : handlePersonalHealthChange("allergies", personalHealth.allergies.includes("None") ? [] : ["None"])}
                                style={{
                                  padding: "0.4rem 0.75rem",
                                  borderRadius: "0.5rem",
                                  border: "1px solid",
                                  background: personalHealth.allergies.includes(allergy) ? "#ef4444" : "rgba(255,255,255,0.05)",
                                  color: personalHealth.allergies.includes(allergy) ? "white" : "var(--text-secondary)",
                                  borderColor: personalHealth.allergies.includes(allergy) ? "#ef4444" : "var(--border-color)",
                                  fontSize: "0.7rem",
                                  cursor: "pointer",
                                }}
                              >
                                {allergy}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                              Stress Level
                            </label>
                            <select
                              value={personalHealth.stressLevel}
                              onChange={(e) => handlePersonalHealthChange("stressLevel", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "0.5rem",
                                color: "white",
                                fontSize: "0.8rem",
                              }}
                            >
                              <option value="low">Low</option>
                              <option value="moderate">Moderate</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                              Sleep Quality
                            </label>
                            <select
                              value={personalHealth.sleepQuality}
                              onChange={(e) => handlePersonalHealthChange("sleepQuality", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "0.5rem",
                                color: "white",
                                fontSize: "0.8rem",
                              }}
                            >
                              <option value="good">Good</option>
                              <option value="fair">Fair</option>
                              <option value="poor">Poor</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                            Hydration Level
                          </label>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {["adequate", "moderate", "low"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handlePersonalHealthChange("hydration", opt)}
                                style={{
                                  padding: "0.5rem 1rem",
                                  borderRadius: "0.5rem",
                                  border: "1px solid",
                                  background: personalHealth.hydration === opt ? "var(--accent-color)" : "rgba(255,255,255,0.05)",
                                  color: personalHealth.hydration === opt ? "white" : "var(--text-secondary)",
                                  borderColor: personalHealth.hydration === opt ? "var(--accent-color)" : "var(--border-color)",
                                  fontSize: "0.8rem",
                                  cursor: "pointer",
                                }}
                              >
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={completeHealthCheck}
                          style={{
                            marginTop: "1rem",
                            padding: "0.75rem",
                            background: "linear-gradient(135deg, var(--accent-color) 0%, #3b82f6 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            width: "100%",
                          }}
                        >
                          Complete Health Assessment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="personal-health-results">
                      <div
                        style={{
                          padding: "1rem",
                          background: getPersonalHealthGuidance?.riskLevel === "HIGH" ? "rgba(239, 68, 68, 0.15)" : getPersonalHealthGuidance?.riskLevel === "MODERATE" ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          borderRadius: "0.75rem",
                          border: `1px solid ${getPersonalHealthGuidance?.riskLevel === "HIGH" ? "rgba(239, 68, 68, 0.4)" : getPersonalHealthGuidance?.riskLevel === "MODERATE" ? "rgba(245, 158, 11, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
                          marginBottom: "1rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <h4 style={{ margin: 0, fontSize: "0.9rem" }}>Personal Health Risk Level</h4>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "1rem",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: getPersonalHealthGuidance?.riskLevel === "HIGH" ? "#ef4444" : getPersonalHealthGuidance?.riskLevel === "MODERATE" ? "#f59e0b" : "#10b981",
                              color: "white",
                            }}
                          >
                            {getPersonalHealthGuidance?.riskLevel}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          Based on your health profile and current location risk
                        </p>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <h4 style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>🎯 What to Do</h4>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                          {getPersonalHealthGuidance?.immediateActions?.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <h4 style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>🛡️ Precautions</h4>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                          {getPersonalHealthGuidance?.precautions?.map((precaution, i) => (
                            <li key={i}>{precaution}</li>
                          ))}
                        </ul>
                      </div>

                      {getPersonalHealthGuidance?.seekCare && (
                        <div
                          style={{
                            padding: "1rem",
                            background: "rgba(239, 68, 68, 0.15)",
                            borderRadius: "0.75rem",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            marginBottom: "1rem",
                          }}
                        >
                          <h4 style={{ margin: "0 0 0.5rem 0", color: "#ef4444", fontSize: "0.85rem" }}>⚠️ Seek Medical Care</h4>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            {getPersonalHealthGuidance.whereToGo}
                          </p>
                        </div>
                      )}

                      <div style={{ marginBottom: "1rem" }}>
                        <h4 style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>📍 Where to Go</h4>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          {getPersonalHealthGuidance?.whereToGo || "Continue with routine care"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={resetHealthCheck}
                        style={{
                          marginTop: "1rem",
                          padding: "0.5rem 1rem",
                          background: "transparent",
                          color: "var(--accent-color)",
                          border: "1px solid var(--accent-color)",
                          borderRadius: "0.5rem",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        Retake Assessment
                      </button>
                    </div>
                  )
                ) : (
                  <div className="risk-radar-placeholder">
                    Search a country or city to unlock the personal health check.
                  </div>
                )}
              </div>

              <div
                className="risk-radar-slide"
                style={{ flex: "0 0 100%", width: "100%", padding: "0 0.5rem", boxSizing: "border-box", minHeight: "320px" }}
              >
                <div className="risk-radar-panel-header">
                  <h3 style={{ marginTop: 10 }}>AI Summary</h3>
                </div>
                {hasLocationAssessment && aiSummary ? (
                  <div className="risk-radar-ai-box">
                    <p className="risk-radar-ai-headline">{aiSummary.headline}</p>
                    <p>{aiSummary.body}</p>
                    <div className="risk-radar-ai-recommendation">
                      <span>AI recommendation: </span>
                      <strong>{aiSummary.recommendation}</strong>
                    </div>

                    <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                      <h4 style={{ marginBottom: "0.75rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "1rem" }}>🎯</span>
                        What to Do Now
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 2 }}>
                        {getAiActionPlan.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                      <h4 style={{ marginBottom: "0.75rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "1rem" }}>📍</span>
                        Where to Go / Who to Contact
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 2 }}>
                        {getAiWhereToGo.map((place, i) => (
                          <li key={i}>{place}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className="risk-radar-chat-button"
                      style={{ opacity: 0.3 }}
                      //onClick={() => setTelvinPopupOpen(true)}
                    >
                      Chat with Telvin for Details
                    </button>
                  </div>
                ) : (
                  <div className="risk-radar-placeholder">
                    Search a country or city to unlock the AI summary and Telvin chat.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="risk-radar-dots"
            aria-label="Risk radar navigation"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            {[0, 1, 2].map((dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                className={`risk-radar-dot ${riskCarouselIndex === dotIndex ? "active" : ""}`}
                onClick={() => setRiskCarouselIndex(dotIndex)}
                aria-label={`View panel ${dotIndex + 1}`}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  border: "none",
                  background: riskCarouselIndex === dotIndex ? "var(--accent-color)" : "var(--border-color)",
                  cursor: "pointer",
                  transition: "background 0.2s, transform 0.2s",
                  opacity: riskCarouselIndex === dotIndex ? 1 : 0.5,
                  transform: riskCarouselIndex === dotIndex ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </motion.div>

        <TelvinPopup
          isOpen={telvinPopupOpen}
          onClose={() => setTelvinPopupOpen(false)}
        />

        {/* Stats Grid */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            marginTop: "-4rem",
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="card glass"
              style={{ textAlign: "center", padding: "1.5rem" }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  color: "var(--accent-color)",
                  marginBottom: "0.5rem",
                }}
              >
                {stat.icon}
              </div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>
                {stat.value}
              </h2>
              <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Latest Alerts 
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "2.5rem",
              marginTop: 20,
            }}
          >
            <div>
              <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
                <RiBroadcastLine style={{ color: "var(--alert-critical)" }} />
                Latest Verified Alerts
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Immediate warnings from our global network.
              </p>
            </div>
            <Link
              to="/alerts"
              style={{
                color: "var(--accent-color)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 600,
              }}
            >
              View All Alerts <FiChevronRight />
            </Link>
          </div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            }}
          >
            {latestAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                variants={itemVariants}
                className={`card alert-card alert-level-${alert.level}`}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "1rem",
                      background: "rgba(255,255,255,0.05)",
                      color:
                        alert.level === 1
                          ? "var(--alert-critical)"
                          : "var(--alert-high)",
                    }}
                  >
                    LEVEL {alert.level}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <FiClock /> {alert.time}
                  </span>
                </div>
                <h3 style={{ marginBottom: "0.5rem", fontSize: "1.25rem" }}>
                  {alert.title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <RiMapPin2Line /> {alert.location}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {alert.verified && (
                    <span
                      style={{
                        color: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      <FiCheckCircle /> Verified Source
                    </span>
                  )}
                  <button
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    Full Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section> */}

        {/* Global Overview Section */}
        <section
          className="global-risk-overview-responsive"
          style={{
            background: "rgba(59, 130, 246, 0.03)",
            borderRadius: "2rem",
            padding: "4rem",
            margin: "4rem 0",
            border: "1px solid var(--border-color)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div>
            <h2 className="section-title">Global Risk Overview</h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--text-secondary)",
                marginBottom: "2rem",
              }}
            >
              Our platform monitors environmental, geopolitical and societal
              data points 24/7 to provide a comprehensive view of global safety.
            </p>
            <div className="grid" style={{ gap: "1.5rem" }}>
              {[
                {
                  title: "Event Verification",
                  desc: "Advanced algorithms cross-reference multiple sources.",
                },
                {
                  title: "Community Driven",
                  desc: "On-the-ground reports from verified contributors.",
                },
                {
                  title: "Response Ready",
                  desc: "Direct links to local aid and relief organizations.",
                },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "var(--accent-color)",
                      flexShrink: 0,
                      marginTop: "4px",
                    }}
                  />
                  <div>
                    <h4 style={{ marginBottom: "0.25rem" }}>{item.title}</h4>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="card glass"
            style={{
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)",
                opacity: 0.3,
              }}
            />
            <FiGlobe
              style={{
                fontSize: "10rem",
                color: "var(--accent-color)",
                opacity: 0.5,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "2rem",
                textAlign: "center",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>
                Interactive Risk Engine
              </h3>
              <Link to="/full-map">
                <button>Launch Full Map</button>
              </Link>
            </div>
          </div>
        </section>

        {/* Active Crises
        <section style={{ marginBottom: "6rem" }}>
          <h2 className="section-title">Active Humanitarian Crises</h2>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            }}
          >
            {activeCrises.map((crisis) => (
              <motion.div
                key={crisis.id}
                variants={itemVariants}
                className="card glass"
                style={{ display: "flex", gap: "2rem" }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "1rem",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                    color: "var(--accent-color)",
                  }}
                >
                  <FiShield />
                </div>
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>{crisis.title}</h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {crisis.region}
                  </p>
                  <div style={{ display: "flex", gap: "2rem" }}>
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Impact
                      </p>
                      <p style={{ fontWeight: 700 }}>{crisis.impact}</p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Severity
                      </p>
                      <p
                        style={{ fontWeight: 700, color: "var(--alert-high)" }}
                      >
                        {crisis.severity}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section> */}
      </div>

      {/* SOS Emergency Request Modal */}
      {showSOSModal && (
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
          onClick={() => setShowSOSModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              width: "80%",
              maxWidth: "1000px",
              height: "100%",
              maxHeight: "600px",
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                  }}
                >
                  🚨
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
                    Emergency SOS Request
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    For life-threatening situations requiring immediate
                    assistance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSOSModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                padding: "2rem",
                height: "calc(100% - 80px)",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                  height: "100%",
                }}
              >
                {/* Left Column - What Counts as Emergency */}
                <div>
                  <h3
                    style={{
                      color: "#ef4444",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiAlertTriangle />
                    What Counts as an Emergency
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        padding: "1rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
                        Natural Disasters
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Someone trapped during earthquake, flood, hurricane or
                        wildfire
                      </p>
                    </div>

                    <div
                      style={{
                        padding: "1rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
                        Violence & Crime
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Witnessing active violence, kidnapping or terrorist
                        incident
                      </p>
                    </div>

                    <div
                      style={{
                        padding: "1rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
                        War & Conflict
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Stuck during active combat, needing evacuation or
                        humanitarian crisis
                      </p>
                    </div>

                    <div
                      style={{
                        padding: "1rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
                        Medical Emergency
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Lost in an unfamiliar territory or place and anything else
                      </p>
                    </div>

                    <div
                      style={{
                        padding: "1rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
                        Other?
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Life-threatening medical situation where local services
                        are unavailable
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Verification Process */}
                <div>
                  <h3
                    style={{
                      color: "#10b981",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiShield />
                    Our Verification Process
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>🤖</span>
                        AI Pre-Screening
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Automatic detection of spam patterns, fake locations,
                        and repeated submissions
                      </p>
                    </div>

                    <div>
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>👥</span>
                        Human Moderation
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Trained moderators verify emergency details and assess
                        urgency levels
                      </p>
                    </div>

                    <div>
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>📍</span>
                        Location Cross-Verification
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        GPS data, IP location, and known crisis zones are
                        cross-referenced
                      </p>
                    </div>

                    <div>
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>🚨</span>
                        Priority Routing
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Critical requests go directly to emergency responders
                        and partner organizations
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "2rem",
                      padding: "1.5rem",
                      background:
                        "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <h4 style={{ margin: "0 0 1rem 0", color: "#10b981" }}>
                      Ready to Submit an Emergency Request?
                    </h4>
                    <p
                      style={{
                        margin: "0 0 1rem 0",
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      This system is for genuine life-threatening emergencies
                      only.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        background:
                          "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Start Emergency Request
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Development Notice Popup */}
      {showDevNotice && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 9999,
            maxWidth: "420px",
          }}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)",
              border: "1px solid var(--border-color)",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Active Development</h3>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>G.R.O.A Platform</p>
                </div>
              </div>
              <button
                onClick={() => { localStorage.setItem("groa-dev-notice-dismissed", "true"); setShowDevNotice(false); }}
                style={{
                  background: "none", border: "none", color: "var(--text-secondary)",
                  fontSize: "1.25rem", cursor: "pointer", padding: "0.25rem",
                  lineHeight: 1, opacity: 0.7, transition: "opacity 0.2s"
                }}
                onMouseOver={(e) => e.target.style.opacity = "1"}
                onMouseOut={(e) => e.target.style.opacity = "0.7"}
                aria-label="Dismiss notice"
              >
                ✕
              </button>
            </div>

            <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              G.R.O.A is currently in active development. Some features and screens may not function as intended or may display stale data while we refine the platform.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--accent-color)", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "rgba(59, 130, 246, 0.1)", borderRadius: "0.5rem", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
              <span>Updates are released every 24 hours — check back for improvements.</span>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => { localStorage.setItem("groa-dev-notice-dismissed", "true"); setShowDevNotice(false); }}
                style={{
                  flex: 1, padding: "0.6rem 1rem", borderRadius: "0.5rem",
                  background: "var(--accent-color)", color: "white", border: "none",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  transition: "opacity 0.2s"
                }}
                onMouseOver={(e) => e.target.style.opacity = "0.9"}
                onMouseOut={(e) => e.target.style.opacity = "1"}
              >
                Understood
              </button>
              <button
                onClick={() => setShowDevNotice(false)}
                style={{
                  padding: "0.6rem 1rem", borderRadius: "0.5rem",
                  background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)",
                  fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
                }}
              >
                Remind Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
