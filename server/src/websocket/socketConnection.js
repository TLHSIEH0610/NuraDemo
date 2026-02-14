import { Server } from "socket.io";
import { verifyToken } from "../auth/jwt.js";
import { config } from "../config.js";
import { z } from "zod";

const schema = z.object({ cityId: z.number() });

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

      const cityId = valid.data.cityId;
      const currentCityId = socket.data.currentCityId;
      if (currentCityId !== undefined && currentCityId !== null && currentCityId !== cityId) {
        socket.leave(`city:${currentCityId}`);
      }
      socket.data.currentCityId = cityId;
      socket.join(`city:${cityId}`);
    });
  });

  return io;
}
