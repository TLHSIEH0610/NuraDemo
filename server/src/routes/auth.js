import express from "express";
import { z } from "zod";
import { signToken } from "../auth/jwt.js";

const schma = z.object({
  username: z.string(),
  password: z.string(),
});

const USERS = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "demo", password: "demo123", role: "user" },
];

function findUserByUsername(username) {
  return USERS.find((u) => u.username === username) ?? null;
}

export const authRouter = express.Router();

authRouter.post("/login", (req, res) => {
  const parsed = schma.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  const { username, password } = parsed.data;
  const user = findUserByUsername(username);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = signToken(user);
  return res.json({
    token,
    user: { username: user.username, role: user.role },
  });
});
