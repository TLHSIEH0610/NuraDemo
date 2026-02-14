export function notFound(req, res) {
  return res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
    requestId: req.id ?? null,
  });
}

export function errorHandler(err, req, res, next) {
  const requestId = req.id ?? null;
  const status = Number(err?.statusCode || err?.status || 500);

  const message =
    status >= 500 ? "Internal Server Error" : String(err?.message || err);

  console.error("error", {
    requestId,
    method: req.method,
    url: req.originalUrl,
    status,
    message: String(err?.message || err),
    stack: err?.stack,
  });

  if (res.headersSent) return next(err);
  return res.status(status).json({
    error: message,
    requestId,
  });
}
