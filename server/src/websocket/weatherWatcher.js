import { config } from "../config.js";
import { getCurrentForecast } from "../services/openMeteor.js";

function getCoordsFromRoom(io, cityId, socketIds) {
  for (const socketId of socketIds) {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) continue;

    const activeCity = socket.data?.activeCity;
    if (!activeCity) continue;
    if (Number(activeCity.cityId) !== Number(cityId)) continue;

    const latitude = activeCity.latitude;
    const longitude = activeCity.longitude;

    if (typeof latitude !== "number" || typeof longitude !== "number") continue;
    return { latitude, longitude };
  }

  return null;
}

export function startWeatherWatcher(io) {
  if (!config.wsWeatherEnabled) return () => {};
  let isTicking = false;

  async function tick() {
    if (isTicking) return;
    isTicking = true;

    try {
      for (const [roomName, socketIds] of io.sockets.adapter.rooms) {
        if (!roomName.startsWith("city:")) continue;
        if (!socketIds || socketIds.size === 0) continue;

        const cityId = Number(roomName.slice("city:".length));
        if (!Number.isFinite(cityId)) continue;

        const coords = getCoordsFromRoom(io, cityId, socketIds);
        if (!coords) continue;

        try {
          const weather = await getCurrentForecast(
            coords.latitude,
            coords.longitude,
          );
          io.to(roomName).emit("weather_update", {
            cityId,
            latitude: coords.latitude,
            longitude: coords.longitude,
            weather,
            fetchedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error("[ws-weather] fetch failed", {
            cityId,
            error: String(err?.message || err),
          });
        }
      }
    } finally {
      isTicking = false;
    }
  }

  const timerId = setInterval(() => {
    void tick();
  }, config.wsWeatherIntervalMs);

  void tick();

  return () => clearInterval(timerId);
}
