const express = require("express");
const {
  getAllOrders,
  getUnseenOrders,
  markOrderAsSeen,
  getOrderStatistics,
} = require("../controllers/orderMonitorController");

const router = express.Router();

router.get("/", getAllOrders);
router.get("/unseen", getUnseenOrders);
router.get("/stats", getOrderStatistics);
router.put("/:id/seen", markOrderAsSeen);

module.exports = router;
