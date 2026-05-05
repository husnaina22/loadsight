from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import predict_load_shedding
from weather import get_temperature
from sms import send_sms
import uvicorn

app = FastAPI(
    title="LoadSight API",
    description="AI-Powered Load Shedding Predictor for Pakistan",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CITY_DATA = {
    "Multan": {
        "areas": ["Gulgasht", "Bosan Road", "Chungi", "Cantt", "Shah Rukn-e-Alam"],
        "disco": "MEPCO",
        "disco_url": "https://www.mepco.com.pk",
        "lat": 30.1575,
        "lng": 71.5249,
    },
    "Kabirwala": {
        "areas": ["5 Kassi", "Main Bazar", "Grain Market", "Railway Road", "New Colony"],
        "disco": "MEPCO",
        "disco_url": "https://www.mepco.com.pk",
        "lat": 30.4058,
        "lng": 71.8670,
    },
    "Lahore": {
        "areas": ["DHA", "Johar Town", "Gulberg", "Model Town", "Bahria Town"],
        "disco": "LESCO",
        "disco_url": "https://www.lesco.gov.pk",
        "lat": 31.5204,
        "lng": 74.3587,
    },
    "Karachi": {
        "areas": ["Clifton", "Gulshan-e-Iqbal", "PECHS", "Korangi", "Malir"],
        "disco": "K-Electric",
        "disco_url": "https://www.ke.com.pk",
        "lat": 24.8607,
        "lng": 67.0011,
    },
}

DISCO_LINKS = {
    "MEPCO": "https://www.mepco.com.pk",
    "LESCO": "https://www.lesco.gov.pk",
    "K-Electric": "https://www.ke.com.pk",
    "IESCO": "https://iesco.com.pk",
    "FESCO": "https://www.fesco.com.pk",
}


@app.get("/")
def root():
    return {
        "status": "online",
        "app": "LoadSight API",
        "version": "1.0.0",
        "endpoints": ["/predict", "/cities", "/disco-links", "/health"],
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/cities")
def get_cities():
    result = {}
    for city, data in CITY_DATA.items():
        result[city] = {
            "areas": data["areas"],
            "disco": data["disco"],
            "disco_url": data["disco_url"],
            "lat": data["lat"],
            "lng": data["lng"],
        }
    return result


@app.get("/predict")
def predict(
    city: str = Query(..., description="City name"),
    hour: int = Query(..., ge=0, le=23, description="Hour of day (0-23)"),
    area: str = Query(None, description="Area within city"),
    phone: str = Query(None, description="Phone for SMS alert"),
):
    if city not in CITY_DATA:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found. Available: {list(CITY_DATA.keys())}")

    temperature = get_temperature(city, hour)
    prediction = predict_load_shedding(city, hour, temperature)

    city_info = CITY_DATA[city]
    disco = city_info["disco"]

    response = {
        "city": city,
        "area": area or "General",
        "hour": hour,
        "temperature": temperature,
        "disco": disco,
        "disco_url": DISCO_LINKS[disco],
        "coordinates": {"lat": city_info["lat"], "lng": city_info["lng"]},
        "prediction": prediction,
        "hourly_forecast": _generate_hourly_forecast(city, temperature),
    }

    if phone and prediction["risk"] in ["High", "Critical"]:
        msg = (
            f"LoadSight Alert: {city} ({area or 'General Area'}) — "
            f"{prediction['risk']} risk load shedding expected. "
            f"~{prediction['hours']} hrs at hour {hour}. "
            f"Contact {disco}: {DISCO_LINKS[disco]}"
        )
        send_sms(phone, msg)
        response["sms_sent"] = True

    return response


@app.get("/disco-links")
def get_disco_links():
    return DISCO_LINKS


def _generate_hourly_forecast(city: str, base_temp: float) -> list:
    forecast = []
    for h in range(24):
        temp = get_temperature(city, h)
        pred = predict_load_shedding(city, h, temp)
        forecast.append({
            "hour": h,
            "temperature": temp,
            "load_mw": pred["load_mw"],
            "risk": pred["risk"],
            "hours": pred["hours"],
        })
    return forecast


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
