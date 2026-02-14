let io = null;

export function setIO(ioInstance) {
  io = ioInstance;
}

export function broadcastMessage({ cityId, message, sentAt }) {
  if (!io) return;
  io.to(`city:${cityId}`).emit("city_message", { cityId, message, sentAt });
}
