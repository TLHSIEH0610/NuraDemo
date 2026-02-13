import express from "express";
import { z } from "zod";
import { searchCity } from "../services/openMeteor.js";

export const citiesRouter = express.Router();

const schema = z.object({
  name: z.string().trim(),
});

citiesRouter.get("/", async (req, res) => {
  const valid = schema.safeParse(req.query);
  if (!valid.success) {
    return res
      .status(400)
      .json({ error: "Invalid query", details: valid.error.flatten() });
  }

  const { name } = valid.data;
  if (!name || name.length < 2) {
    return res.json({ cities: [] });
  }

  try {
    const cities = await searchCity(name);
    return res.json({ cities });
  } catch (err) {
    return res.status(502).json({
      error: `Failed to search cities for ${name}`,
      details: String(err?.message || err),
    });
  }
});
