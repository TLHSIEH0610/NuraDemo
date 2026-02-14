import express from "express";
import { z } from "zod";

import { broadcastMessage } from "../websocket/broadcast.js";

export const messagesRouter = express.Router();

const schema = z.object({
  cityId: z.number(),
  message: z.string().trim(),
});

messagesRouter.post("/", (req, res) => {
  const valid = schema.safeParse(req.body);
  if (!valid.success) {
    return res
      .status(400)
      .json({ error: "Invalid body", details: valid.error.flatten() });
  }

  const { cityId, message } = valid.data;

  const sentAt = new Date().toISOString();
  broadcastMessage({
    cityId,
    message,
    sentAt,
  });

  return res.json({ ok: true, sentAt });
});
