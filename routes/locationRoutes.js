const express = require("express");
const router = express.Router();

const {
  fetchCountries,
  fetchStates,
  fetchLocalities
} = require("../controllers/locationController");

router.get("/countries", fetchCountries);
router.get("/states", fetchStates);
router.get("/localities", fetchLocalities);

module.exports = router; // ✅ THIS LINE IS CRITICAL
