import express from "express";
import { z } from "zod";
import { http } from "../services/utils.js";
import { searchCity, getCurrentForecast } from "../services/openMeteor.js";

const seedCities = [
  { name: "Melbourne", country: "AU", latitude: -37.8136, longitude: 144.9631 },
  { name: "Sydney", country: "AU", latitude: -33.8688, longitude: 151.2093 },
  { name: "Brisbane", country: "AU", latitude: -27.4698, longitude: 153.0251 },
  { name: "Perth", country: "AU", latitude: -31.9523, longitude: 115.8613 },
  { name: "Adelaide", country: "AU", latitude: -34.9285, longitude: 138.6007 },
  { name: "Canberra", country: "AU", latitude: -35.2809, longitude: 149.13 },
  { name: "Hobart", country: "AU", latitude: -42.8821, longitude: 147.3272 },
  { name: "Darwin", country: "AU", latitude: -12.4634, longitude: 130.8456 },
  { name: "Auckland", country: "NZ", latitude: -36.8485, longitude: 174.7633 },
  {
    name: "Wellington",
    country: "NZ",
    latitude: -41.2865,
    longitude: 174.7762,
  },
  { name: "Singapore", country: "SG", latitude: 1.3521, longitude: 103.8198 },
  { name: "Tokyo", country: "JP", latitude: 35.6762, longitude: 139.6503 },
  { name: "Taipei", country: "TW", latitude: 25.033, longitude: 121.5654 },
  { name: "London", country: "GB", latitude: 51.5074, longitude: -0.1278 },
  { name: "New York", country: "US", latitude: 40.7128, longitude: -74.006 },
];

export const citiesRoute = express.Router();

const schema = z.object({
  name: z.string().trim(),
  country: z.string().trim(),
  latitude: z.string().trim(),
  longitude: z.string().trim(),
});

citiesRoute.get("/", async (req, res) => {
  const valid = schema.safeParse(req.query);
  if (!valid.success) {
    return res
      .status(400)
      .json({ error: "Invalid query", details: parsed.error.flatten() });
  }
  const name = valid.data.name;
  if (!name) {
    return res.json({ cities: seedCities });
  }

  try {
    const result = await searchCity(name);
    return res.json(result);
  } catch {
    return res
      .status(502)
      .json({ error: `Failed to get Geocoding for ${name}` });
  }
});
