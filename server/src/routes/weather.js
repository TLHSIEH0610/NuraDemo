import express from "express";
import { z } from "zod";
import { getCurrentForecast } from "../services/openMeteor.js";

export const weatherRouter = express.Router();

const schema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

weatherRouter.get("/", async (req, res) => {
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid query", details: parsed.error.flatten() });
  }

  const { latitude, longitude } = parsed.data;
  try {
    const forecast = await getCurrentForecast(latitude, longitude);
    return res.json(forecast);
  } catch (err) {
    return res.status(502).json({
      error: "Failed to fetch forecast",
      details: String(err?.message || err),
    });
  }
});
