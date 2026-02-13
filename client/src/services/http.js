export async function http(endpoint, { method, body, token } = {}) {
  const res = await fetch(endpoint, {
    method,
    header: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Request failed (${res.status})`);
  }

  return data;
}
