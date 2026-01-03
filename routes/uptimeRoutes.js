const express = require("express");
const router = express.Router();
const { uptimeCheck } = require("../controllers/uptimeController");

router.get("/", uptimeCheck);

module.exports = router;
