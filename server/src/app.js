import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { citiesRouter } from "./routes/cities.js";
import { weatherRouter } from "./routes/weather.js";
import { messagesRouter } from "./routes/messages.js";

export default function createApp() {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: config.corsOrigin,
    }),
  );
  app.use("/api/auth", authRouter);
  app.use("/api/cities", citiesRouter);
  app.use("/api/weather", weatherRouter);
  app.use("/api/messages", messagesRouter);

  return app;
}
