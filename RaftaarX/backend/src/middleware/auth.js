import jwt from "jsonwebtoken";

import User from "../models/User.js";

export async function protect(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next({ statusCode: 401, message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.AUTH_SECRET || process.env.JWT_SECRET
    );
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next({ statusCode: 401, message: "User not found" });
    }

    req.user = user;
    next();
  } catch {
    next({ statusCode: 401, message: "Invalid or expired token" });
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next({ statusCode: 403, message: "Access denied" });
    }

    next();
  };
}
