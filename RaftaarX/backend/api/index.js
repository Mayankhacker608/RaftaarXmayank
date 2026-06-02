import "dotenv/config";
import app from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";

// Reuse DB connection across cold starts
let dbReady = null;
async function ensureDb() {
  if (!dbReady) {
    dbReady = connectDatabase().catch((err) => {
      dbReady = null;
      throw err;
    });
  }

  return dbReady;
}

export default async function handler(req, res) {
  try {
    await ensureDb();
  } catch (error) {
    console.error("Database connection failed:", error.message || error);
    res.status(500).json({ success: false, message: "Database connection failed" });
    return;
  }

  return app(req, res);
}
import app from "../src/app.js";

export default app;
