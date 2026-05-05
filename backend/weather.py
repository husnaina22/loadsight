"""
LoadSight Weather Module
Fetches temperature data for Pakistani cities.
Currently uses realistic mock data with optional OpenWeatherMap integration.
"""

import math
import os
import urllib.request
import json
from typing import Optional

# ─── City baseline temperatures (°C) by season/time ───────────────────────────
CITY_TEMPS = {
    "Multan": {
        "base": 38.0,
        "amplitude": 8.0,
        "night_drop": 10.0,
    },
    "Kabirwala": {
        "base": 37.0,
        "amplitude": 7.5,
        "night_drop": 9.5,
    },
    "Lahore": {
        "base": 35.0,
        "amplitude": 7.0,
        "night_drop": 9.0,
    },
    "Karachi": {
        "base": 32.0,
        "amplitude": 4.0,
        "night_drop": 5.0,
    },
}

DEFAULT_TEMP = {
    "base": 36.0,
    "amplitude": 7.0,
    "night_drop": 9.0,
}


def get_temperature(city: str, hour: int) -> float:
    """
    Get temperature for a city at a given hour.
    Tries OpenWeatherMap if API key available, else uses realistic mock.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if api_key:
        try:
            return _fetch_real_temperature(city, api_key)
        except Exception:
            pass
    return _mock_temperature(city, hour)


def _mock_temperature(city: str, hour: int) -> float:
    """
    Realistic temperature model based on Pakistan climate patterns.
    Peak heat at ~14:00, coolest at ~05:00.
    """
    profile = CITY_TEMPS.get(city, DEFAULT_TEMP)
    base = profile["base"]
    amp = profile["amplitude"]
    drop = profile["night_drop"]

    # Sinusoidal daily cycle: peak at 14:00, trough at 05:00
    angle = (hour - 14) * (2 * math.pi / 24)
    temp = base + amp * math.cos(angle)

    # Extra night cooling
    if 22 <= hour or hour <= 6:
        temp -= drop * 0.4

    import random
    random.seed(hour * 7 + hash(city) % 100)
    temp += random.uniform(-0.8, 0.8)

    return round(temp, 1)


def _fetch_real_temperature(city: str, api_key: str) -> float:
    """Fetch live temperature from OpenWeatherMap API."""
    city_query = {
        "Multan": "Multan,PK",
        "Kabirwala": "Kabirwala,PK",
        "Lahore": "Lahore,PK",
        "Karachi": "Karachi,PK",
    }.get(city, f"{city},PK")

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?q={city_query}&appid={api_key}&units=metric"
    )
    with urllib.request.urlopen(url, timeout=5) as resp:
        data = json.loads(resp.read())
        return round(data["main"]["temp"], 1)
