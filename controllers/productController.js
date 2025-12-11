// controllers/productController.js
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const cloudinary = require("../config/cloudinary");
const Category = require("../models/Category");
const fs = require("fs");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, featured } = req.body;

    // Validate category
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Create product first
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      categoryId,
      featured: featured || false
    });

    // Upload images to Cloudinary
    const images = [];

    for (const file of req.files) {
      const uploaded = await cloudinary.uploader.upload(file.path, {
        folder: "fashionfactor_products"
      });

      const imageRecord = await ProductImage.create({
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
        productId: product.id
      });

      images.push(imageRecord);

      // Remove local file from uploads folder
      fs.unlinkSync(file.path);
    }

    res.status(201).json({
      message: "Product created successfully",
      product,
      images
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [Category, ProductImage]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET SINGLE PRODUCT
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [Category, ProductImage]
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.update(req.body);

    res.json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    const images = await ProductImage.findAll({ where: { productId: product.id } });

    // Delete images from Cloudinary
    for (const img of images) {
      await cloudinary.uploader.destroy(img.public_id);
      await img.destroy();
    }

    await product.destroy();

    res.json({ message: "Product deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
