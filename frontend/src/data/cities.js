export const CITIES = {
  Multan: {
    areas: ["Gulgasht", "Bosan Road", "Chungi", "Cantt", "Shah Rukn-e-Alam"],
    disco: "MEPCO",
    lat: 30.1575,
    lng: 71.5249,
  },
  Kabirwala: {
    areas: ["5 Kassi", "Main Bazar", "Grain Market", "Railway Road", "New Colony"],
    disco: "MEPCO",
    lat: 30.4058,
    lng: 71.867,
  },
  Lahore: {
    areas: ["DHA", "Johar Town", "Gulberg", "Model Town", "Bahria Town"],
    disco: "LESCO",
    lat: 31.5204,
    lng: 74.3587,
  },
  Karachi: {
    areas: ["Clifton", "Gulshan-e-Iqbal", "PECHS", "Korangi", "Malir"],
    disco: "K-Electric",
    lat: 24.8607,
    lng: 67.0011,
  },
};

export const DISCO_LINKS = {
  MEPCO: "https://www.mepco.com.pk",
  LESCO: "https://www.lesco.gov.pk",
  "K-Electric": "https://www.ke.com.pk",
  IESCO: "https://iesco.com.pk",
  FESCO: "https://www.fesco.com.pk",
};

export const RISK_CONFIG = {
  Low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "Low Risk", icon: "✓" },
  Moderate: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Moderate Risk", icon: "!" },
  High: { color: "#f97316", bg: "rgba(249,115,22,0.1)", label: "High Risk", icon: "⚠" },
  Critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Critical Risk", icon: "✕" },
};
