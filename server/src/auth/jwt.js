import jwt from "jsonwebtoken";
import { config } from "../config.js";

function signToken(user) {
  return jwt.sign(
    {
      sub: user.username,
      role: user.role,
    },
    config.JWT_SECRET,
    { expiresIn: "12h" },
  );
}

function verifyToken(token) {
  return jwt.verify(token, config.JWT_SECRET);
}

export { signToken, verifyToken };
