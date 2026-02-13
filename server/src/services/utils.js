export async function httpJson(url, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let res;
  let data = null;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    throw new Error(
      `Open-Meteo error for ${url}: ${String(err?.message || err)}`,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  return { res, data };
}
