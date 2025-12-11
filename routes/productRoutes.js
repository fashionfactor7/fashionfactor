// routes/productRoutes.js
const express = require("express");
const upload = require("../utils/multer");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();

// Upload up to 10 images
router.post("/create", upload.array("images", 10), createProduct);

router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
