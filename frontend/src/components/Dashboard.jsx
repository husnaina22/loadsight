import React from "react";
import { RISK_CONFIG, DISCO_LINKS, CITIES } from "../data/cities.js";

function Skeleton({ width = "100%", height = 20, radius = 6 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, var(--bg-3) 25%, var(--bg-4) 50%, var(--bg-3) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

function StatCard({ label, value, unit, sub, accent, loading }) {
  return (
    <div style={{ ...styles.statCard, ...(accent ? { borderColor: accent, boxShadow: `0 0 24px ${accent}22` } : {}) }}>
      <div style={styles.statLabel}>{label}</div>
      {loading ? (
        <Skeleton height={36} width="70%" radius={4} />
      ) : (
        <div style={styles.statValue}>
          <span style={{ color: accent || "var(--text-0)" }}>{value}</span>
          {unit && <span style={styles.statUnit}>{unit}</span>}
        </div>
      )}
      {sub && !loading && <div style={styles.statSub}>{sub}</div>}
    </div>
  );
}

function RiskMeter({ risk, loading }) {
  const cfg = RISK_CONFIG[risk] || RISK_CONFIG["Low"];
  const pct = { Low: 15, Moderate: 40, High: 68, Critical: 92 }[risk] || 0;

  return (
    <div style={{ ...styles.riskCard, background: cfg.bg, borderColor: cfg.color + "44" }}>
      <div style={styles.riskHeader}>
        <span style={styles.riskLabel}>RISK LEVEL</span>
        <span style={{ ...styles.riskBadge, color: cfg.color, borderColor: cfg.color + "44" }}>
          {cfg.icon} {risk}
        </span>
      </div>
      <div style={styles.meterTrack}>
        <div
          style={{
            ...styles.meterFill,
            width: loading ? "0%" : `${pct}%`,
            background: cfg.color,
            boxShadow: `0 0 12px ${cfg.color}88`,
            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      <div style={styles.riskTicks}>
        {["Low", "Moderate", "High", "Critical"].map((r) => (
          <span key={r} style={{ ...styles.riskTick, color: r === risk ? cfg.color : "var(--text-2)" }}>
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

function UtilizationGauge({ pct, loading }) {
  const color = pct < 65 ? "#22c55e" : pct < 80 ? "#f59e0b" : pct < 92 ? "#f97316" : "#ef4444";
  const r = 40;
  const circ = 2 * Math.PI * r;
  const stroke = loading ? 0 : (pct / 100) * circ;

  return (
    <div style={styles.gaugeCard}>
      <div style={styles.statLabel}>GRID UTILIZATION</div>
      <div style={styles.gaugeSvgWrap}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--bg-4)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={circ - stroke}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
          <text x="50" y="54" textAnchor="middle" fill={color} fontSize="16" fontFamily="JetBrains Mono, monospace" fontWeight="600">
            {loading ? "--" : `${pct}%`}
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function Dashboard({ result, loading, city, area, hour }) {
  const pred = result?.prediction;
  const risk = pred?.risk || "Low";
  const cfg = RISK_CONFIG[risk];
  const disco = result?.disco || CITIES[city]?.disco;

  return (
    <div style={styles.wrap}>
      {/* Top row */}
      <div style={styles.topRow}>
        <RiskMeter risk={risk} loading={loading} />

        <div style={styles.statsGrid}>
          <StatCard
            label="TEMPERATURE"
            value={loading ? "--" : result?.temperature}
            unit="°C"
            sub="Current city temp"
            accent="var(--accent)"
            loading={loading}
          />
          <StatCard
            label="EXPECTED OUTAGE"
            value={loading ? "--" : pred?.hours || 0}
            unit="hrs"
            sub="Predicted duration"
            accent={pred?.color}
            loading={loading}
          />
          <StatCard
            label="LOAD DEMAND"
            value={loading ? "--" : pred?.load_mw}
            unit=" MW"
            sub="Estimated grid load"
            loading={loading}
          />
          <StatCard
            label="CONFIDENCE"
            value={loading ? "--" : pred?.confidence}
            unit="%"
            sub="Model accuracy"
            loading={loading}
          />
        </div>

        <UtilizationGauge pct={pred?.utilization_pct || 0} loading={loading} />
      </div>

      {/* Location + Disco info */}
      <div style={styles.infoRow}>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>◎</div>
          <div>
            <div style={styles.infoLabel}>LOCATION</div>
            <div style={styles.infoValue}>{city} — {area}</div>
            <div style={styles.infoSub}>Hour {String(hour).padStart(2, "0")}:00 local time</div>
          </div>
        </div>

        {disco && (
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>⚡</div>
            <div>
              <div style={styles.infoLabel}>DISTRIBUTION COMPANY</div>
              <div style={styles.infoValue}>{disco}</div>
              <a
                href={result?.disco_url || DISCO_LINKS[disco]}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.discoLink}
              >
                Visit official portal →
              </a>
            </div>
          </div>
        )}

        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>◈</div>
          <div>
            <div style={styles.infoLabel}>MODEL INFO</div>
            <div style={styles.infoValue}>RandomForest AI</div>
            <div style={styles.infoSub}>Trained on Pakistan grid patterns</div>
          </div>
        </div>

        <div style={{ ...styles.infoCard, borderColor: cfg?.color + "44", background: cfg?.bg }}>
          <div style={{ ...styles.infoIcon, color: cfg?.color }}>⬡</div>
          <div>
            <div style={styles.infoLabel}>RECOMMENDATION</div>
            <div style={{ ...styles.infoValue, color: cfg?.color }}>
              {risk === "Low" && "Power supply stable. Normal usage."}
              {risk === "Moderate" && "Minor disruptions possible. Charge devices."}
              {risk === "High" && "Significant outages likely. Use UPS/generator."}
              {risk === "Critical" && "Extended cuts expected. Conserve power NOW."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    background: "var(--bg-2)",
    border: "1px solid var(--border)",
    borderTop: "none",
    borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  topRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  statsGrid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    minWidth: 260,
  },
  statCard: {
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    transition: "border-color 0.3s",
  },
  statLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: "var(--text-2)",
    letterSpacing: "0.14em",
  },
  statValue: {
    fontFamily: "var(--font-mono)",
    fontSize: 28,
    fontWeight: 600,
    lineHeight: 1,
    display: "flex",
    alignItems: "baseline",
    gap: 4,
  },
  statUnit: {
    fontSize: 13,
    color: "var(--text-2)",
  },
  statSub: {
    fontSize: 11,
    color: "var(--text-2)",
    marginTop: 2,
  },
  riskCard: {
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    flex: "0 0 260px",
    transition: "all 0.3s",
  },
  riskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riskLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: "var(--text-2)",
    letterSpacing: "0.14em",
  },
  riskBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 100,
    border: "1px solid",
    letterSpacing: "0.04em",
  },
  meterTrack: {
    height: 8,
    background: "var(--bg-4)",
    borderRadius: 100,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 100,
  },
  riskTicks: {
    display: "flex",
    justifyContent: "space-between",
  },
  riskTick: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    letterSpacing: "0.04em",
  },
  gaugeCard: {
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    flex: "0 0 150px",
  },
  gaugeSvgWrap: {
    display: "flex",
    justifyContent: "center",
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },
  infoCard: {
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "16px 18px",
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    transition: "all 0.3s",
  },
  infoIcon: {
    fontSize: 18,
    color: "var(--accent)",
    flexShrink: 0,
    marginTop: 1,
  },
  infoLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: "var(--text-2)",
    letterSpacing: "0.14em",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-0)",
    lineHeight: 1.3,
  },
  infoSub: {
    fontSize: 11,
    color: "var(--text-2)",
    marginTop: 3,
  },
  discoLink: {
    fontSize: 11,
    color: "var(--accent)",
    textDecoration: "none",
    marginTop: 3,
    display: "block",
  },
};
