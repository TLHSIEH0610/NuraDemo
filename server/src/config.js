import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || "4000"),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET || "nuraJWT",
  wsWeatherEnabled: process.env.WS_WEATHER_ENABLED !== "false",
  wsWeatherIntervalMs: Math.max(
    60_000,
    Number(process.env.WS_WEATHER_INTERVAL_MS || "60000"),
  ),
};
