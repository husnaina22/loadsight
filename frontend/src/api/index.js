import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const fetchPrediction = async ({ city, hour, area, phone }) => {
  const params = { city, hour };
  if (area) params.area = area;
  if (phone) params.phone = phone;
  const { data } = await api.get("/predict", { params });
  return data;
};

export const fetchCities = async () => {
  const { data } = await api.get("/cities");
  return data;
};

export const fetchDiscoLinks = async () => {
  const { data } = await api.get("/disco-links");
  return data;
};

export const checkHealth = async () => {
  const { data } = await api.get("/health");
  return data;
};
