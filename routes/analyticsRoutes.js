const express = require("express");
const {
  getDashboardAnalytics,
  getBestSellingProducts,
  getMonthlyRevenue,
  getOrderInvoiceAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/dashboard", getDashboardAnalytics);
router.get("/best-sellers", getBestSellingProducts);
router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/order-invoice", getOrderInvoiceAnalytics);

module.exports = router;
