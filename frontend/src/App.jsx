import React, { useState, useEffect, useCallback } from "react";
import Dashboard from "./components/Dashboard.jsx";
import ChartView from "./components/ChartView.jsx";
import MapView from "./components/MapView.jsx";
import Header from "./components/Header.jsx";
import { fetchPrediction, checkHealth } from "./api/index.js";
import { CITIES } from "./data/cities.js";

export default function App() {
  const [city, setCity] = useState("Multan");
  const [area, setArea] = useState("Gulgasht");
  const [hour, setHour] = useState(new Date().getHours());
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Update area when city changes
  useEffect(() => {
    setArea(CITIES[city]?.areas[0] || "");
  }, [city]);

  // Check backend health
  useEffect(() => {
    checkHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const handlePredict = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrediction({ city, hour, area, phone: phone || undefined });
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Could not connect to LoadSight API. Check backend status."
      );
    } finally {
      setLoading(false);
    }
  }, [city, hour, area, phone]);

  // Auto-predict on mount
  useEffect(() => {
    if (backendOnline) handlePredict();
  }, [backendOnline]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "⬡" },
    { id: "chart", label: "Load Chart", icon: "◈" },
    { id: "map", label: "Map View", icon: "◎" },
  ];

  return (
    <div style={styles.app}>
      {/* Ambient background */}
      <div style={styles.ambientBg} />
      <div style={styles.gridOverlay} />

      <Header backendOnline={backendOnline} />

      {/* Controls Bar */}
      <div style={styles.controlsBar}>
        <div style={styles.controlsInner}>
          <div style={styles.controlGroup}>
            <label style={styles.label}>CITY</label>
            <select
              style={styles.select}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              {Object.keys(CITIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>AREA</label>
            <select
              style={styles.select}
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              {(CITIES[city]?.areas || []).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>HOUR (0–23)</label>
            <div style={styles.hourWrapper}>
              <input
                type="range"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.hourDisplay}>{String(hour).padStart(2, "0")}:00</span>
            </div>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>SMS ALERT (optional)</label>
            <input
              type="tel"
              placeholder="+923001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
            />
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            style={{
              ...styles.predictBtn,
              ...(loading ? styles.predictBtnLoading : {}),
            }}
          >
            {loading ? (
              <span style={styles.spinner}>◌</span>
            ) : (
              <>⚡ PREDICT</>
            )}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={styles.errorBanner}>
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} style={styles.errorClose}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              ...styles.tab,
              ...(activeTab === t.id ? styles.tabActive : {}),
            }}
          >
            <span style={styles.tabIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main style={styles.main}>
        {activeTab === "dashboard" && (
          <Dashboard result={result} loading={loading} city={city} area={area} hour={hour} />
        )}
        {activeTab === "chart" && (
          <ChartView result={result} loading={loading} />
        )}
        {activeTab === "map" && (
          <MapView city={city} result={result} />
        )}
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "var(--bg-0)",
    position: "relative",
    overflow: "hidden",
  },
  ambientBg: {
    position: "fixed",
    top: "-30%",
    left: "-10%",
    width: "60%",
    height: "60%",
    background: "radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  gridOverlay: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
    zIndex: 0,
  },
  controlsBar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(6,8,16,0.92)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border)",
    padding: "12px 0",
  },
  controlsInner: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "flex-end",
    gap: 16,
    flexWrap: "wrap",
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: "1 1 140px",
    minWidth: 120,
  },
  label: {
    fontSize: 10,
    fontFamily: "var(--font-mono)",
    color: "var(--text-2)",
    letterSpacing: "0.12em",
  },
  select: {
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text-0)",
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
    transition: "border 0.2s",
  },
  input: {
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text-0)",
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    width: "100%",
  },
  hourWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "6px 12px",
  },
  slider: {
    flex: 1,
    accentColor: "var(--accent)",
    cursor: "pointer",
    height: 4,
  },
  hourDisplay: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--accent)",
    whiteSpace: "nowrap",
    minWidth: 36,
  },
  predictBtn: {
    background: "var(--accent)",
    color: "#000",
    border: "none",
    borderRadius: 8,
    padding: "10px 24px",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "0.08em",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
    transition: "opacity 0.2s, transform 0.1s",
    alignSelf: "flex-end",
  },
  predictBtnLoading: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  spinner: {
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
  errorBanner: {
    background: "var(--red-dim)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    padding: "10px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
    fontFamily: "var(--font-mono)",
  },
  errorClose: {
    background: "none",
    border: "none",
    color: "#fca5a5",
    cursor: "pointer",
    fontSize: 14,
  },
  tabBar: {
    display: "flex",
    gap: 4,
    padding: "12px 24px 0",
    maxWidth: 1280,
    margin: "0 auto",
  },
  tab: {
    background: "none",
    border: "1px solid transparent",
    borderRadius: "8px 8px 0 0",
    color: "var(--text-2)",
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.2s",
    letterSpacing: "0.04em",
  },
  tabActive: {
    background: "var(--bg-2)",
    borderColor: "var(--border)",
    borderBottomColor: "var(--bg-2)",
    color: "var(--accent)",
  },
  tabIcon: {
    fontSize: 14,
  },
  main: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 24px 48px",
    position: "relative",
    zIndex: 1,
  },
};
