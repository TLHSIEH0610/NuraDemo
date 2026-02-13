export async function http(url, timeout = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeout);

  let res;
  let data = [];
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    data = res.results;
  } catch (err) {
    throw new Error(`Open-Meteo error: ${String(err?.message || err)}`);
  } finally {
    clearTimeout(timeout);
  }

  return { res, data };
}
