require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const routes = require("./routes");
const { errorResponse } = require("./config/response");
const db = require("./config/db");
const { saveDb, scheduleSave } = require("./config/persist");
const connectDB = require("./config/database");

const app = express();
const PORT = process.env.PORT || 8000;

// Initialize database connection
connectDB();

// ─── Middleware ───────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : "*";
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection is active for each request (vital for Vercel serverless cold-starts)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    // continue
  }
  next();
});

// ─── Auto-persist mutable data after write requests finish ──
// (fallback persist so data is also preserved offline)
app.use((req, res, next) => {
  if (req.method !== "GET") {
    res.on("finish", () => {
      if (res.statusCode < 400) scheduleSave(db);
    });
  }
  next();
});

// ─── Static Files (uploaded images) ──────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── API Routes ───────────────────────────────────────────
app.use("/api", routes);
app.use(routes);

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
  return errorResponse(res, `Route ${req.method} ${req.url} not found.`, 404);
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  return errorResponse(res, err.message || "Internal server error.", 500);
});

// ─── Start Server ─────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`✅ Sonic API running at http://127.0.0.1:${PORT}/api`);
});

// ─── Graceful Shutdown (save data before exiting) ────────
const shutdown = (signal) => {
  console.log(`\n${signal} received. Saving data and shutting down...`);
  saveDb(db);
  server.close(() => process.exit(0));
  // Force exit if it hangs for too long
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
