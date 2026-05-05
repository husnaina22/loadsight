import React from "react";
import { DISCO_LINKS } from "../data/cities.js";

export default function Header({ backendOnline }) {
  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <div style={styles.brand}>
          <div style={styles.logoMark}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#00d4ff" strokeWidth="1.5"/>
              <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="rgba(0,212,255,0.15)" stroke="#00d4ff" strokeWidth="1"/>
              <circle cx="14" cy="14" r="3" fill="#00d4ff"/>
            </svg>
          </div>
          <div>
            <div style={styles.logoText}>LOADSIGHT</div>
            <div style={styles.logoSub}>AI LOAD SHEDDING PREDICTOR</div>
          </div>
        </div>

        <div style={styles.center}>
          <div style={styles.badge}>
            <span style={styles.badgeDot(backendOnline)} />
            <span style={styles.badgeText}>
              {backendOnline === null ? "CONNECTING" : backendOnline ? "API ONLINE" : "API OFFLINE"}
            </span>
          </div>
        </div>

        <nav style={styles.disco}>
          {Object.entries(DISCO_LINKS).map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={styles.discoLink}>
              {name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    borderBottom: "1px solid var(--border)",
    background: "rgba(6,8,16,0.95)",
    backdropFilter: "blur(20px)",
    position: "sticky",
    top: 0,
    zIndex: 200,
  },
  inner: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoMark: {
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: "0.15em",
    color: "var(--text-0)",
  },
  logoSub: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: "0.18em",
    color: "var(--text-2)",
    marginTop: 1,
  },
  center: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: 100,
    padding: "4px 12px",
  },
  badgeDot: (online) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: online === null ? "#6b7a96" : online ? "#22c55e" : "#ef4444",
    boxShadow: online ? "0 0 6px #22c55e" : "none",
    flexShrink: 0,
  }),
  badgeText: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--text-2)",
    letterSpacing: "0.12em",
  },
  disco: {
    display: "flex",
    gap: 4,
    flexWrap: "wrap",
  },
  discoLink: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--text-2)",
    textDecoration: "none",
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid var(--border)",
    letterSpacing: "0.06em",
    transition: "color 0.2s, border-color 0.2s",
  },
};
