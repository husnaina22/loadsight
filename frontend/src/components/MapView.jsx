import React, { useEffect, useState } from "react";
import { CITIES, RISK_CONFIG } from "../data/cities.js";

function RiskLegend() {
  return (
    <div style={styles.legend}>
      {Object.entries(RISK_CONFIG).map(([r, cfg]) => (
        <div key={r} style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: cfg.color }} />
          <span style={styles.legendLabel}>{r}</span>
        </div>
      ))}
    </div>
  );
}

function LeafletMap({ city, result }) {
  const [components, setComponents] = useState(null);

  useEffect(() => {
    import("react-leaflet").then((rl) => {
      setComponents(rl);
    });
  }, []);

  if (!components) {
    return (
      <div style={styles.mapLoading}>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-2)", fontSize: 13 }}>
          Loading map...
        </span>
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = components;
  const selectedCity = CITIES[city];
  const center = selectedCity ? [selectedCity.lat, selectedCity.lng] : [30.37, 69.35];
  const prediction = result && result.prediction;
  const riskColor = prediction ? prediction.color : "#22c55e";

  return (
    <MapContainer
      key={city}
      center={center}
      zoom={7}
      style={{ width: "100%", height: "100%", borderRadius: "var(--radius)" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      {Object.entries(CITIES).map(([cityName, data]) => {
        const isSelected = cityName === city;
        const color = isSelected ? riskColor : "#6b7a96";
        return (
          <CircleMarker
            key={cityName}
            center={[data.lat, data.lng]}
            radius={isSelected ? 14 : 8}
            pathOptions={{
              color: "white",
              weight: isSelected ? 2 : 1,
              fillColor: color,
              fillOpacity: isSelected ? 0.95 : 0.6,
            }}
          >
            <Popup>
              <div style={styles.popup}>
                <div style={styles.popupCity}>{cityName}</div>
                <div style={styles.popupDisco}>DISCO: {data.disco}</div>
                {isSelected && prediction && (
                  <>
                    <div style={{ ...styles.popupRisk, color: prediction.color }}>Risk: {prediction.risk}</div>
                    <div style={styles.popupDetail}>Load: {prediction.load_mw} MW</div>
                    <div style={styles.popupDetail}>Outage: ~{prediction.hours} hrs</div>
                    <div style={styles.popupDetail}>Utilization: {prediction.utilization_pct}%</div>
                  </>
                )}
                <div style={styles.popupCoord}>{data.lat.toFixed(4)}, {data.lng.toFixed(4)}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      {selectedCity && (
        <CircleMarker
          center={[selectedCity.lat, selectedCity.lng]}
          radius={22}
          pathOptions={{ color: riskColor, weight: 1.5, fillColor: "transparent", fillOpacity: 0, opacity: 0.4 }}
        />
      )}
    </MapContainer>
  );
}

export default function MapView({ city, result }) {
  const prediction = result && result.prediction;
  const riskColor = prediction ? prediction.color : "#22c55e";

  return (
    <div style={styles.wrap}>
      <div style={styles.toolbar}>
        <div style={styles.title}>
          <span style={styles.titleIcon}>◎</span>
          Pakistan Power Grid — City Coverage
        </div>
        <RiskLegend />
      </div>
      <div style={styles.mapContainer}>
        <LeafletMap city={city} result={result} />
      </div>
      <div style={styles.cityCards}>
        {Object.entries(CITIES).map(([cityName, data]) => (
          <div key={cityName} style={{
            ...styles.cityCard,
            ...(cityName === city ? { borderColor: riskColor + "66", background: riskColor + "0d" } : {}),
          }}>
            <div style={styles.cityCardName}>{cityName}</div>
            <div style={styles.cityCardDisco}>{data.disco}</div>
            <div style={styles.cityCardCoord}>{data.lat.toFixed(2)}°N, {data.lng.toFixed(2)}°E</div>
            {cityName === city && prediction && (
              <div style={{ ...styles.cityCardRisk, color: riskColor }}>
                ⚡ {prediction.risk} · {prediction.hours}h
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { background: "var(--bg-2)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)", padding: 24, display: "flex", flexDirection: "column", gap: 16 },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 },
  title: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--text-1)" },
  titleIcon: { color: "var(--accent)", fontSize: 16 },
  legend: { display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  legendLabel: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-2)" },
  mapContainer: { height: 420, borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", background: "var(--bg-3)" },
  mapLoading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" },
  cityCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 },
  cityCard: { background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 16px", transition: "all 0.3s" },
  cityCardName: { fontWeight: 700, fontSize: 14, color: "var(--text-0)", marginBottom: 3 },
  cityCardDisco: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-2)", letterSpacing: "0.06em" },
  cityCardCoord: { fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-2)", marginTop: 4, opacity: 0.6 },
  cityCardRisk: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, marginTop: 8, letterSpacing: "0.04em" },
  popup: { fontFamily: "system-ui, sans-serif", minWidth: 160 },
  popupCity: { fontWeight: 800, fontSize: 14, marginBottom: 4, color: "#111" },
  popupDisco: { fontSize: 11, color: "#555", marginBottom: 4, fontFamily: "monospace" },
  popupRisk: { fontWeight: 700, fontSize: 12, marginBottom: 3 },
  popupDetail: { fontSize: 11, color: "#444", fontFamily: "monospace", marginBottom: 1 },
  popupCoord: { fontSize: 10, color: "#888", marginTop: 6, fontFamily: "monospace" },
};
