import { http } from "./utils.js";

export async function searchCity(name) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const { res, data } = http(url.toString());
  if (!res.ok) {
    throw new Error("pen-Meteo geocoding failed");
  }

  return data.map((r) => ({
    name: r.name,
    country: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function getCurrentForecast(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,wind_speed_10m,weather_code");
  url.searchParams.set("timezone", "auto");

  const { res, data } = http(url.toString());
  if (!res.ok) {
    throw new Error("pen-Meteo frecast failed");
  }

  return {
    timezone: data?.timezone ?? null,
    current: data?.current ?? null,
  };
}
