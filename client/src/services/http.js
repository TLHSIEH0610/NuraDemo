export async function http(endpoint, { method = "GET", body, token, ...arg }) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...arg,
  };

  if (config.method.toUpperCase() !== "GET") {
    config.body = JSON.stringify(body || {});
  }
  const res = await fetch(endpoint, config);

  let result = null;
  try {
    result = await res.json();
  } catch {
    result = null;
  }

  if (!res.ok) {
    const message =
      (result && typeof result === "object" && result.error) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = result;
    throw err;
  }

  return result;
}
