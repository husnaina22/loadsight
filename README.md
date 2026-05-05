# ⚡ LoadSight — AI-Powered Load Shedding Predictor for Pakistan

A full-stack production application that uses a **RandomForest ML model** to predict load shedding risk across Pakistani cities, with real-time temperature simulation, interactive charts, and SMS alerts.

---

## 🗂 Project Structure

```
loadsight/
├── frontend/          # React + Vite dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Dashboard.jsx   # Stats, risk meter, gauge
│   │   │   ├── ChartView.jsx   # Recharts load/temp/outage charts
│   │   │   └── MapView.jsx     # React-Leaflet city map
│   │   ├── api/index.js        # Axios API client
│   │   ├── data/cities.js      # Area + DISCO data
│   │   ├── App.jsx             # Main app with controls
│   │   └── index.css           # Global dark theme
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── index.html
│
├── backend/           # FastAPI + ML
│   ├── main.py        # API routes
│   ├── model.py       # RandomForest ML model
│   ├── weather.py     # Temperature fetcher (mock + OWM)
│   ├── sms.py         # SMS alerts (mock + Twilio)
│   ├── requirements.txt
│   ├── render.yaml
│   └── Procfile
│
└── README.md
```

---

## 🚀 Local Development

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env          # Set VITE_API_URL=http://localhost:8000
npm run dev                   # Starts on http://localhost:3000
```

---

## ☁️ Deployment

### Backend → Render

1. Push `backend/` folder to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, select `backend/` as root
4. Set:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. (Optional) Add environment variables:
   - `OPENWEATHER_API_KEY` — for real weather data
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` — for real SMS

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import repo, set root to `frontend/`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://loadsight-api.onrender.com`)
5. Deploy — Vercel auto-detects Vite

---

## 🌟 Features

| Feature | Details |
|---------|---------|
| 🤖 ML Model | RandomForest classifier + regressor (risk + hours) |
| 🌡 Weather | Mock hourly temperature model, OpenWeatherMap-ready |
| 📊 Charts | 24hr load, temperature, outage forecasts (Recharts) |
| 🗺 Map | Interactive Leaflet map with city risk overlays |
| 📱 SMS | Twilio-ready alert service with mock fallback |
| ⚡ Cities | Multan, Kabirwala, Lahore, Karachi |
| 🔗 DISCOs | MEPCO, LESCO, K-Electric, IESCO, FESCO links |

---

## 📡 API Reference

### `GET /predict`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `city` | string | ✅ | Multan, Kabirwala, Lahore, Karachi |
| `hour` | int 0-23 | ✅ | Hour of day |
| `area` | string | ❌ | Area within city |
| `phone` | string | ❌ | Phone for SMS alert |

**Response:**
```json
{
  "city": "Multan",
  "area": "Gulgasht",
  "hour": 14,
  "temperature": 41.2,
  "disco": "MEPCO",
  "disco_url": "https://www.mepco.com.pk",
  "prediction": {
    "risk": "High",
    "risk_index": 2,
    "hours": 3.4,
    "load_mw": 512.3,
    "utilization_pct": 84.1,
    "confidence": 91.2,
    "color": "#f97316"
  },
  "hourly_forecast": [...]
}
```

### `GET /cities` — All city/area data  
### `GET /disco-links` — DISCO portal URLs  
### `GET /health` — API health check  

---

## 🛠 Tech Stack

**Frontend:** React 18, Vite, Recharts, React-Leaflet, Axios  
**Backend:** FastAPI, scikit-learn (RandomForest), NumPy, uvicorn  
**Deployment:** Vercel (frontend), Render (backend)  

---

## 📝 License

MIT — Built for Pakistan's power monitoring ecosystem.
