const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

require("../models/ScheduledPost");

const {
  createScheduledPost,
  getScheduledPosts,
  deleteScheduledPost
} = require("../controllers/scheduledPostController");

const router = express.Router();

router.post("/", upload.array("images"), createScheduledPost);
router.get("/", getScheduledPosts);
router.delete("/:id", deleteScheduledPost);

module.exports = router;
