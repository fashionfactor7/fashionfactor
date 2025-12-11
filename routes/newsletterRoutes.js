const express = require("express");
require("../models/Newsletter");  // <-- Load model early

const {
  subscribe,
  getSubscribers,
  deleteSubscriber
} = require("../controllers/newsletterController");

const router = express.Router();

router.post("/subscribe", subscribe);
router.get("/", getSubscribers);
router.delete("/:id", deleteSubscriber);

module.exports = router;
