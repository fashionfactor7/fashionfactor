const ScheduledPost = require("../models/ScheduledPost");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// CREATE A SCHEDULED PRODUCT POST
exports.createScheduledPost = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, scheduledAt } = req.body;

    // Validate category
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Create the product but keep it inactive
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      categoryId,
      isActive: false, // IMPORTANT: Not visible until scheduled
      featured: false
    });

    // Upload images to Cloudinary
    const images = [];
    for (const file of req.files) {
      const uploaded = await cloudinary.uploader.upload(file.path, {
        folder: "scheduled_products"
      });

      const img = await ProductImage.create({
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
        productId: product.id
      });

      images.push(img);

      fs.unlinkSync(file.path);
    }

    // Create scheduled post
    const scheduledPost = await ScheduledPost.create({
      productId: product.id,
      scheduledAt
    });

    res.status(201).json({
      message: "Product scheduled successfully",
      product,
      images,
      scheduledPost
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL SCHEDULED POSTS
exports.getScheduledPosts = async (req, res) => {
  try {
    const posts = await ScheduledPost.findAll({
      include: [Product],
      order: [["scheduledAt", "ASC"]]
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE SCHEDULED POST
exports.deleteScheduledPost = async (req, res) => {
  try {
    const post = await ScheduledPost.findByPk(req.params.id);

    if (!post) return res.status(404).json({ message: "Scheduled post not found" });

    await post.destroy();

    res.json({ message: "Scheduled post deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
