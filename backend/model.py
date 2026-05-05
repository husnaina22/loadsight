"""
LoadSight ML Model
Uses a trained RandomForestClassifier to predict load shedding risk.
Trained on synthetic but realistic Pakistan power grid patterns.
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import warnings

warnings.filterwarnings("ignore")

# ─── City-specific load profiles ──────────────────────────────────────────────
CITY_PROFILES = {
    "Multan": {
        "base_load": 180,
        "peak_multiplier": 1.6,
        "temp_sensitivity": 2.2,
        "grid_capacity": 520,
        "summer_factor": 1.2,
    },
    "Kabirwala": {
        "base_load": 55,
        "peak_multiplier": 1.5,
        "temp_sensitivity": 2.0,
        "grid_capacity": 140,
        "summer_factor": 1.18,
    },
    "Lahore": {
        "base_load": 780,
        "peak_multiplier": 1.45,
        "temp_sensitivity": 1.8,
        "grid_capacity": 1800,
        "summer_factor": 1.12,
    },
    "Karachi": {
        "base_load": 1400,
        "peak_multiplier": 1.4,
        "temp_sensitivity": 1.5,
        "grid_capacity": 3000,
        "summer_factor": 1.08,
    },
}

RISK_LABELS = ["Low", "Moderate", "High", "Critical"]
RISK_COLORS = {
    "Low": "#22c55e",
    "Moderate": "#f59e0b",
    "High": "#f97316",
    "Critical": "#ef4444",
}


def _build_training_data():
    """Generate synthetic training data based on Pakistan grid patterns."""
    np.random.seed(42)
    X, y_risk, y_hours, y_load = [], [], [], []

    cities = list(CITY_PROFILES.keys())

    for _ in range(4000):
        city = np.random.choice(cities)
        hour = np.random.randint(0, 24)
        temp = np.random.uniform(15, 48)
        profile = CITY_PROFILES[city]

        # Demand calculation
        hour_factor = _hour_demand_factor(hour)
        temp_factor = max(0, (temp - 25) * profile["temp_sensitivity"] / 100)
        summer_factor = profile["summer_factor"] if temp > 32 else 1.0

        load = (
            profile["base_load"]
            * profile["peak_multiplier"]
            * hour_factor
            * (1 + temp_factor)
            * summer_factor
        )
        load += np.random.normal(0, profile["base_load"] * 0.05)
        load = max(profile["base_load"] * 0.4, load)

        capacity = profile["grid_capacity"]
        utilization = load / capacity

        # Risk thresholds
        if utilization < 0.65:
            risk = 0  # Low
            hrs = 0.0
        elif utilization < 0.80:
            risk = 1  # Moderate
            hrs = np.random.uniform(0.5, 2.0)
        elif utilization < 0.92:
            risk = 2  # High
            hrs = np.random.uniform(2.0, 4.5)
        else:
            risk = 3  # Critical
            hrs = np.random.uniform(4.5, 8.0)

        city_enc = cities.index(city)
        X.append([city_enc, hour, temp, utilization, hour_factor, temp_factor])
        y_risk.append(risk)
        y_hours.append(hrs)
        y_load.append(round(load, 1))

    return np.array(X), np.array(y_risk), np.array(y_hours), np.array(y_load)


def _hour_demand_factor(hour: int) -> float:
    """Pakistan-specific hourly demand curve."""
    curve = {
        0: 0.52, 1: 0.48, 2: 0.45, 3: 0.43, 4: 0.44,
        5: 0.50, 6: 0.62, 7: 0.72, 8: 0.80, 9: 0.85,
        10: 0.88, 11: 0.90, 12: 0.95, 13: 0.98, 14: 1.00,
        15: 0.99, 16: 0.97, 17: 0.96, 18: 0.94, 19: 0.98,
        20: 1.00, 21: 0.95, 22: 0.80, 23: 0.65,
    }
    return curve.get(hour, 0.7)


# ─── Train models at module load ───────────────────────────────────────────────
_X, _y_risk, _y_hours, _y_load = _build_training_data()

_risk_model = RandomForestClassifier(
    n_estimators=150, max_depth=12, random_state=42, n_jobs=-1
)
_risk_model.fit(_X, _y_risk)

_hours_model = RandomForestRegressor(
    n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
)
_hours_model.fit(_X, _y_hours)

_load_model = RandomForestRegressor(
    n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
)
_load_model.fit(_X, _y_load)

_cities_list = list(CITY_PROFILES.keys())


def predict_load_shedding(city: str, hour: int, temperature: float) -> dict:
    """
    Predict load shedding for given city, hour, and temperature.

    Returns:
        dict with risk level, expected hours, load (MW), confidence, and color.
    """
    profile = CITY_PROFILES.get(city, CITY_PROFILES["Multan"])
    city_enc = _cities_list.index(city) if city in _cities_list else 0

    hour_factor = _hour_demand_factor(hour)
    temp_factor = max(0, (temperature - 25) * profile["temp_sensitivity"] / 100)
    summer_factor = profile["summer_factor"] if temperature > 32 else 1.0

    raw_load = (
        profile["base_load"]
        * profile["peak_multiplier"]
        * hour_factor
        * (1 + temp_factor)
        * summer_factor
    )
    utilization = raw_load / profile["grid_capacity"]

    features = np.array([[city_enc, hour, temperature, utilization, hour_factor, temp_factor]])

    risk_idx = int(_risk_model.predict(features)[0])
    risk_proba = _risk_model.predict_proba(features)[0]
    confidence = round(float(np.max(risk_proba)) * 100, 1)

    predicted_hours = float(_hours_model.predict(features)[0])
    predicted_hours = round(max(0, predicted_hours), 1)

    predicted_load = float(_load_model.predict(features)[0])
    predicted_load = round(max(0, predicted_load), 1)

    risk_label = RISK_LABELS[risk_idx]

    return {
        "risk": risk_label,
        "risk_index": risk_idx,
        "hours": predicted_hours,
        "load_mw": predicted_load,
        "capacity_mw": profile["grid_capacity"],
        "utilization_pct": round(utilization * 100, 1),
        "confidence": confidence,
        "color": RISK_COLORS[risk_label],
        "hour_factor": round(hour_factor, 2),
    }
