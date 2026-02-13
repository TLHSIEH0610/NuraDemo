import { httpJson } from "./utils.js";

export async function searchCity(name) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const { res, data } = await httpJson(url.toString());
  if (!res.ok || data?.error) {
    const reason = data?.reason ? `: ${data.reason}` : "";
    throw new Error(`Open-Meteo geocoding failed${reason}`);
  }

  const results = data?.results ?? [];
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    elevation: r.elevation ?? null,
    featureCode: r.feature_code ?? null,
    countryCode: r.country_code ?? null,
    country: r.country ?? null,
    admin1: r.admin1 ?? null,
    admin2: r.admin2 ?? null,
    admin3: r.admin3 ?? null,
    admin4: r.admin4 ?? null,
    timezone: r.timezone ?? null,
  }));
}

export async function getCurrentForecast(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,wind_speed_10m,weather_code");
  url.searchParams.set("timezone", "auto");

  const { res, data } = await httpJson(url.toString());
  if (!res.ok) {
    throw new Error("Open-Meteo forecast failed");
  }

  return {
    timezone: data?.timezone ?? null,
    current: data?.current ?? null,
  };
}
