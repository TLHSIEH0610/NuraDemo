import { Server } from "socket.io";
import { verifyToken } from "../auth/jwt.js";
import { config } from "../config.js";
import { z } from "zod";

const schema = z.object({
  cityId: z.number(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export function connectSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const { sub, role } = verifyToken(token);
      socket.data.user = { username: sub, role };
      next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join_city", (payload) => {
      const valid = schema.safeParse(payload);
      if (!valid.success) return;

      const { cityId, latitude, longitude } = valid.data;

      const currentCityId = socket.data.currentCityId;
      if (
        currentCityId !== undefined &&
        currentCityId !== null &&
        currentCityId !== cityId
      ) {
        socket.leave(`city:${currentCityId}`);
      }

      socket.data.currentCityId = cityId;
      socket.data.activeCity = {
        cityId,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      };
      socket.join(`city:${cityId}`);
    });
  });

  return io;
}
