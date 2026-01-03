const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =======================
   🔥 UPTIME ROUTE (NO DB)
======================= */
const uptimeRoutes = require("./routes/uptimeRoutes");
app.use("/uptime", uptimeRoutes);

/* =======================
   API ROUTES
======================= */
app.use("/auth", require("./routes/authRoutes"));
app.use("/categories", require("./routes/categoryRoutes"));
app.use("/products", require("./routes/productRoutes"));
app.use("/newsletter", require("./routes/newsletterRoutes"));
app.use("/broadcasts", require("./routes/broadcastRoutes"));
app.use("/scheduled-posts", require("./routes/scheduledPostRoutes"));
app.use("/orders", require("./routes/orderRoutes"));
app.use("/invoices", require("./routes/invoiceRoutes"));
app.use("/order-monitor", require("./routes/orderMonitorRoutes"));
app.use("/api/locations", require("./routes/locationRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));

/* =======================
   PAYSTACK WEBHOOK
======================= */
app.use(
  "/orders/paystack-webhook",
  express.raw({ type: "application/json" })
);

/* =======================
   ROOT (DO NOT USE FOR UPTIME)
======================= */
app.get("/", (req, res) => {
  res.json({ message: "Fashion Factor API is running!" });
});

/* =======================
   DATABASE INIT (OPTIMIZED)
======================= */
const sequelize = require("./config/sequelize");

sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ Database connected");

    // ⚠️ Prevents unnecessary compute usage in production
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync();
      console.log("✅ Sequelize models synchronized");
    }
  })
  .catch(err => console.error("❌ DB error:", err));

/* =======================
   SCHEDULER (CONTROLLED)
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
});
