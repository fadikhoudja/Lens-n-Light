require("dotenv").config();
const Sentry = require("@sentry/node");
const { validateEnv } = require("./constants");

validateEnv();

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || "development",
  integrations: [Sentry.expressIntegration()],
});

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/auth");
const photoRoutes = require("./routes/photos");
const bookingRoutes = require("./routes/bookings");

app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/bookings", bookingRoutes);

Sentry.setupExpressErrorHandler(app);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("DB error:", err));

app.listen(process.env.PORT || 5000, () => {
  console.log("Server on port", process.env.PORT || 5000);
});
