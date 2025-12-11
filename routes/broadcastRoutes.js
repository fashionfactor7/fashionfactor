const express = require("express");
require("../models/Broadcast"); // <-- Load model early so Sequelize syncs

const {
  createBroadcast,
  getBroadcasts,
  deleteBroadcast
} = require("../controllers/broadcastController");

const router = express.Router();

router.post("/", createBroadcast);
router.get("/", getBroadcasts);
router.delete("/:id", deleteBroadcast);

module.exports = router;
