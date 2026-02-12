import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";

export default function createApp() {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: config.corsOrigin,
    }),
  );
  app.use("/api/auth", authRouter);
  return app;
}
