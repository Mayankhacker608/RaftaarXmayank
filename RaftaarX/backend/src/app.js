import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { connectDatabase } from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";

const app = express();
const defaultClient = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultClient)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOrigins = process.env.ALLOW_ALL_ORIGINS === "true";
const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const vercelPattern = /^https?:\/\/.*\.vercel\.app$/;
const renderPattern = /^https?:\/\/.*\.onrender\.com$/;
const localAddressPattern = /^(::1|::ffff:127\.0\.0\.1|127\.0\.0\.1)$/;

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 200,
  skip: (req) =>
    process.env.NODE_ENV !== "production" && localAddressPattern.test(req.ip),
  message: {
    success: false,
    message: "Too many login attempts. Please try again in a few minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: allowAllOrigins
      ? true
      : (origin, callback) => {
          if (
            !origin ||
            allowedOrigins.includes(origin) ||
            localhostPattern.test(origin) ||
            vercelPattern.test(origin) ||
            renderPattern.test(origin)
          ) {
            callback(null, true);
            return;
          }

          callback(new Error("Origin is not allowed by CORS"));
        },
    credentials: true,
  })
);

if (allowAllOrigins) {
  // Helpful debug message when the permissive toggle is enabled in env
  // Do NOT enable in production unless you understand the implications.
  // This mirrors the request origin for credentialed requests.
  // See: https://github.com/expressjs/cors#configuration-options
  // and set ALLOW_ALL_ORIGINS=true for temporary debugging.
  console.warn("WARNING: ALLOW_ALL_ORIGINS is enabled — CORS is permissive.");
}
app.use(async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "RaftaarX backend is running" });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/admin", adminRoutes);

app.use((error, _req, res, _next) => {
  const uploadErrorMessages = {
    LIMIT_FILE_SIZE:
      "Each upload must be 2 MB or smaller. Please compress the file and try again.",
    LIMIT_UNEXPECTED_FILE:
      "Upload field is not supported or too many files were selected. Upload Aadhar, DL, RC, insurance, and up to 10 bike images.",
    LIMIT_FILE_COUNT:
      "Too many files selected. Upload Aadhar, DL, RC, insurance, and up to 10 bike images.",
  };
  const isUploadLimitError = Boolean(uploadErrorMessages[error.code]);
  const isValidationError = error.name === "ValidationError";
  const isMongoDocumentTooLarge =
    error.name === "MongoServerError" &&
    String(error.message || "").toLowerCase().includes("object to insert too large");
  const statusCode =
    error.statusCode || (isUploadLimitError || isValidationError || isMongoDocumentTooLarge ? 400 : 500);
  const message = isMongoDocumentTooLarge
    ? "Uploaded files are too large to save. Please compress documents/images and try again."
    : uploadErrorMessages[error.code] || error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;
