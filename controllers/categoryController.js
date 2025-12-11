const Category = require("../models/Category");

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const exists = await Category.findOne({ where: { name } });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name, description });
    res.status(201).json({ message: "Category created", category });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    await category.update(req.body);
    res.json({ message: "Category updated", category });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    await category.destroy();
    res.json({ message: "Category deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
