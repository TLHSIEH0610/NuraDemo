import crypto from "crypto";

export function requestId(req, res, next) {
  const id =
    (typeof crypto.randomUUID === "function" && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  req.id = id;
  res.setHeader("x-request-id", id);
  next();
}

export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const id = req.id ? ` ${req.id}` : "";
    console.log(
      `[http]${id} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`,
    );
  });
  next();
}

