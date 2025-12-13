const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const sequelize = require("./config/sequelize"); // ✅ ADD THIS

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);

//webhook
app.use("/orders/paystack-webhook", express.raw({ type: "application/json" }));


const categoryRoutes = require("./routes/categoryRoutes");
app.use("/categories", categoryRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/products", productRoutes);

const newsletterRoutes = require("./routes/newsletterRoutes");
app.use("/newsletter", newsletterRoutes);

const broadcastRoutes = require("./routes/broadcastRoutes");
app.use("/broadcasts", broadcastRoutes);

const scheduledPostRoutes = require("./routes/scheduledPostRoutes");
app.use("/scheduled-posts", scheduledPostRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/orders", orderRoutes);

const invoiceRoutes = require("./routes/invoiceRoutes");
app.use("/invoices", invoiceRoutes);

const orderMonitorRoutes = require("./routes/orderMonitorRoutes");
app.use("/order-monitor", orderMonitorRoutes);





const activateScheduledPosts = require("./utils/scheduler");
activateScheduledPosts();


// Test route
app.get("/", (req, res) => {
  res.json({ message: "Fashion Factor API is running!" });
});

// Sync Models
sequelize
  .sync()
  .then(() => console.log("✅ Sequelize models synchronized"))
  .catch(err => console.error("❌ Sequelize sync error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FashionFactor Server running on port ${PORT}`);
});
