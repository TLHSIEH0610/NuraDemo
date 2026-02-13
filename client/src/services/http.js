export async function http(
  endpoint,
  { method = "GET", data, token, ...arg } = {},
) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...arg,
  };

  if (config.method.toUpperCase() !== "GET") {
    config.body = JSON.stringify(data || {});
  }
  const res = await fetch(endpoint, config);
  const result = await res.json();
  if (!res.ok) {
    console.error(`Request failed (${res.status})`);
  }

  return result;
}
