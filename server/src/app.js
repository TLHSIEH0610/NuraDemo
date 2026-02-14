import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { citiesRouter } from "./routes/cities.js";
import { weatherRouter } from "./routes/weather.js";
import { messagesRouter } from "./routes/messages.js";
import { requestId, requestLogger } from "./middleware/http.js";
import { errorHandler, notFound } from "./middleware/errors.js";

export default function createApp() {
  const app = express();
  app.use(requestId);
  app.use(requestLogger);
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
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

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
