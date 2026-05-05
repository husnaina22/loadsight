import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { RISK_CONFIG } from "../data/cities.js";

const RISK_COLORS_MAP = { Low: "#22c55e", Moderate: "#f59e0b", High: "#f97316", Critical: "#ef4444" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const risk = payload[0]?.payload?.risk || "Low";
  const cfg = RISK_CONFIG[risk];
  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipHeader}>{String(label).padStart(2, "0")}:00</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={styles.tooltipRow}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-0)" }}>
            {p.value}{p.dataKey === "load_mw" ? " MW" : p.dataKey === "temperature" ? "°C" : " hrs"}
          </span>
        </div>
      ))}
      <div style={{ ...styles.tooltipRisk, color: cfg?.color }}>
        {cfg?.icon} {risk}
      </div>
    </div>
  );
};

function EmptyState() {
  return (
    <div style={styles.empty}>
      <div style={styles.emptyIcon}>◈</div>
      <div style={styles.emptyText}>Run a prediction to see charts</div>
    </div>
  );
}

export default function ChartView({ result, loading }) {
  const [activeChart, setActiveChart] = useState("load");

  if (!result && !loading) return (
    <div style={styles.wrap}><EmptyState /></div>
  );

  const data = (result?.hourly_forecast || []).map((d) => ({
    ...d,
    fill: RISK_COLORS_MAP[d.risk] || "#22c55e",
  }));

  const currentHour = result?.hour;

  const charts = [
    { id: "load", label: "Load vs Time" },
    { id: "temp", label: "Temperature" },
    { id: "hours", label: "Outage Hours" },
  ];

  return (
    <div style={styles.wrap}>
      <div style={styles.toolbar}>
        <div style={styles.chartTabs}>
          {charts.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChart(c.id)}
              style={{ ...styles.chartTab, ...(activeChart === c.id ? styles.chartTabActive : {}) }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div style={styles.meta}>
          {result?.city && (
            <span style={styles.metaText}>
              {result.city} · 24hr Forecast
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingDot} />
          <span style={styles.loadingText}>Generating forecast...</span>
        </div>
      )}

      {!loading && data.length > 0 && (
        <>
          {activeChart === "load" && (
            <div style={styles.chartWrap}>
              <div style={styles.chartTitle}>Grid Load Demand (MW) — 24 Hours</div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <defs>
                    <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(h) => `${String(h).padStart(2, "0")}h`}
                    tick={{ fill: "#6b7a96", fontSize: 11, fontFamily: "JetBrains Mono" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.07)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6b7a96", fontSize: 11, fontFamily: "JetBrains Mono" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {currentHour !== undefined && (
                    <ReferenceLine
                      x={currentHour}
                      stroke="#00d4ff"
                      strokeDasharray="4 4"
                      label={{ value: "NOW", fill: "#00d4ff", fontSize: 10, fontFamily: "JetBrains Mono" }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="load_mw"
                    name="Load"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    fill="url(#loadGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#00d4ff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === "temp" && (
            <div style={styles.chartWrap}>
              <div style={styles.chartTitle}>Temperature (°C) — 24 Hours</div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(h) => `${String(h).padStart(2, "0")}h`}
                    tick={{ fill: "#6b7a96", fontSize: 11, fontFamily: "JetBrains Mono" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.07)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6b7a96", fontSize: 11, fontFamily: "JetBrains Mono" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}°`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {currentHour !== undefined && (
                    <ReferenceLine x={currentHour} stroke="#00d4ff" strokeDasharray="4 4" />
                  )}
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    name="Temp"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#tempGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#f97316" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeChart === "hours" && (
            <div style={styles.chartWrap}>
              <div style={styles.chartTitle}>Expected Outage Duration (hrs) — 24 Hours</div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(h) => `${String(h).padStart(2, "0")}h`}
                    tick={{ fill: "#6b7a96", fontSize: 11, fontFamily: "JetBrains Mono" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.07)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6b7a96", fontSize: 11, fontFamily: "JetBrains Mono" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {currentHour !== undefined && (
                    <ReferenceLine x={currentHour} stroke="#00d4ff" strokeDasharray="4 4" />
                  )}
                  <Bar
                    dataKey="hours"
                    name="Outage"
                    radius={[3, 3, 0, 0]}
                    fill="#f59e0b"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Risk timeline strip */}
          <div style={styles.riskStrip}>
            <div style={styles.riskStripLabel}>RISK TIMELINE</div>
            <div style={styles.riskBlocks}>
              {data.map((d) => (
                <div
                  key={d.hour}
                  title={`${String(d.hour).padStart(2, "0")}:00 — ${d.risk}`}
                  style={{
                    ...styles.riskBlock,
                    background: RISK_COLORS_MAP[d.risk] || "#22c55e",
                    opacity: d.hour === currentHour ? 1 : 0.6,
                    transform: d.hour === currentHour ? "scaleY(1.5)" : "scaleY(1)",
                  }}
                />
              ))}
            </div>
            <div style={styles.riskStripHours}>
              {[0, 6, 12, 18, 23].map((h) => (
                <span key={h} style={{ ...styles.riskStripH, left: `${(h / 23) * 100}%` }}>
                  {String(h).padStart(2, "0")}h
                </span>
              ))}
            </div>
          </div>
        </>
      )}
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
    minHeight: 400,
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartTabs: {
    display: "flex",
    gap: 4,
  },
  chartTab: {
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--text-2)",
    padding: "6px 14px",
    fontSize: 12,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  chartTabActive: {
    background: "var(--accent-dim)",
    borderColor: "var(--accent)",
    color: "var(--accent)",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-2)",
    letterSpacing: "0.06em",
  },
  chartWrap: {
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "20px 16px 12px",
  },
  chartTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-2)",
    letterSpacing: "0.08em",
    marginBottom: 16,
  },
  tooltip: {
    background: "var(--bg-1)",
    border: "1px solid var(--border-bright)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
  },
  tooltipHeader: {
    fontWeight: 600,
    color: "var(--text-0)",
    marginBottom: 6,
    fontSize: 13,
  },
  tooltipRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 3,
    fontSize: 11,
  },
  tooltipRisk: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: 600,
  },
  riskStrip: {
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "16px 16px 28px",
    position: "relative",
  },
  riskStripLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: "var(--text-2)",
    letterSpacing: "0.14em",
    marginBottom: 10,
  },
  riskBlocks: {
    display: "flex",
    gap: 2,
    height: 20,
    alignItems: "center",
  },
  riskBlock: {
    flex: 1,
    height: "100%",
    borderRadius: 2,
    cursor: "default",
    transition: "transform 0.3s, opacity 0.3s",
  },
  riskStripHours: {
    position: "relative",
    height: 16,
    marginTop: 6,
  },
  riskStripH: {
    position: "absolute",
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: "var(--text-2)",
    transform: "translateX(-50%)",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 12,
    padding: 80,
  },
  emptyIcon: {
    fontSize: 40,
    color: "var(--text-2)",
  },
  emptyText: {
    color: "var(--text-2)",
    fontSize: 14,
    fontFamily: "var(--font-mono)",
  },
  loadingOverlay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 60,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--accent)",
    animation: "pulse 1s infinite",
  },
  loadingText: {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    color: "var(--text-2)",
  },
};
