import jwt from "jsonwebtoken";

export function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.AUTH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}
