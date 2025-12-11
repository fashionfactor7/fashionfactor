const express = require("express");
require("../models/Order");

const {
  initializePayment,
  verifyPayment,
  paystackWebhook
} = require("../controllers/orderController");

const router = express.Router();

router.post("/init", initializePayment);
router.get("/verify-payment", verifyPayment);
router.post("/paystack-webhook", express.raw({ type: "application/json" }), paystackWebhook);

module.exports = router;
