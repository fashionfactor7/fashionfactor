const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

/* =======================
   ALLOWED ORIGINS
   Only these domains may
   send requests to the API
======================= */
const ALLOWED_ORIGINS = [
  "https://fashionfactor.online",
  "https://www.fashionfactor.online",
];

// In development, also allow localhost
if (process.env.NODE_ENV !== "production") {
  ALLOWED_ORIGINS.push(
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5500"
  );
}

/* =======================
   CORS CONFIGURATION
======================= */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin only in development
    // (e.g. curl, Postman, server-to-server calls)
    if (!origin) {
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      // In production, block requests with no origin
      // EXCEPT the Paystack webhook (handled separately below)
      return callback(new Error("No origin — request blocked"), false);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error(`CORS policy: origin ${origin} is not allowed`), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
};

/* =======================
   SECURITY HEADERS (Helmet)
   Sets Content-Security-Policy,
   X-Frame-Options, HSTS, etc.
======================= */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow image/upload serving
    contentSecurityPolicy: false, // Keep disabled unless you control the frontend HTML
  })
);

/* =======================
   PAYSTACK WEBHOOK
   Must come BEFORE express.json()
   so we get the raw body for
   HMAC signature verification.
   Also exempt from CORS — Paystack
   is a server-to-server call.
======================= */
app.use(
  "/orders/paystack-webhook",
  express.raw({ type: "application/json" })
);

/* =======================
   GLOBAL MIDDLEWARE
======================= */
app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));         // Limit JSON body size
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =======================
   RATE LIMITING
   Protects against brute force
   and abuse on sensitive routes
======================= */

// General API limiter — 120 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
  skip: (req) => process.env.NODE_ENV !== "production",
});

// Strict limiter for payment routes — 20 requests per 15 minutes per IP
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment attempts. Please wait and try again." },
  skip: (req) => process.env.NODE_ENV !== "production",
});

// Auth limiter — 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
  skip: (req) => process.env.NODE_ENV !== "production",
});

// Newsletter limiter — prevent spam subscriptions
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many subscription attempts. Please try again later." },
  skip: (req) => process.env.NODE_ENV !== "production",
});

// Apply general limiter to all routes
app.use(generalLimiter);

/* =======================
   UPTIME ROUTE (NO DB, NO CORS NEEDED)
======================= */
const uptimeRoutes = require("./routes/uptimeRoutes");
app.use("/uptime", uptimeRoutes);

/* =======================
   API ROUTES
======================= */
app.use("/auth",              authLimiter,      require("./routes/authRoutes"));
app.use("/categories",                          require("./routes/categoryRoutes"));
app.use("/products",                            require("./routes/productRoutes"));
app.use("/newsletter",        newsletterLimiter, require("./routes/newsletterRoutes"));
app.use("/broadcasts",                          require("./routes/broadcastRoutes"));
app.use("/scheduled-posts",                     require("./routes/scheduledPostRoutes"));
app.use("/orders",            paymentLimiter,   require("./routes/orderRoutes"));
app.use("/invoices",                            require("./routes/invoiceRoutes"));
app.use("/order-monitor",                       require("./routes/orderMonitorRoutes"));
app.use("/api/locations",                       require("./routes/locationRoutes"));
app.use("/api/analytics",                       require("./routes/analyticsRoutes"));
app.use("/api/activity",                        require("./routes/activityRoutes"));

/* =======================
   ROOT
======================= */
app.get("/", (req, res) => {
  res.json({ message: "Fashion Factor API is running!" });
});

/* =======================
   GLOBAL ERROR HANDLER
   Catches CORS errors and
   other unhandled errors —
   never leaks stack traces
   in production
======================= */
app.use((err, req, res, next) => {
  // CORS error
  if (err.message && err.message.startsWith("CORS policy")) {
    return res.status(403).json({ error: "Access denied: origin not allowed" });
  }
  if (err.message === "No origin — request blocked") {
    return res.status(403).json({ error: "Access denied: missing origin" });
  }

  // Log full error server-side only
  console.error("Unhandled error:", err.message);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Never expose internals to the client in production
  const message = process.env.NODE_ENV !== "production"
    ? err.message
    : "An internal server error occurred";

  return res.status(err.status || 500).json({ error: message });
});

/* =======================
   DATABASE INIT
======================= */
const sequelize = require("./config/sequelize");

sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Database connected");
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync();
      console.log("✅ Sequelize models synchronized");
    }
  })
  .catch(err => console.error("❌ DB error:", err));

/* =======================
   SCHEDULER
======================= */
if (process.env.ENABLE_SCHEDULER === "true") {
  const activateScheduledPosts = require("./utils/scheduler");
  activateScheduledPosts();
}

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FashionFactor Server running on port ${PORT}`);
  console.log(`🔒 CORS restricted to: ${ALLOWED_ORIGINS.join(", ")}`);
});