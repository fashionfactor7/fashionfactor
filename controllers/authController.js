const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
 // ✅ Use Sequelize Model

// REGISTER ADMIN
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin exists
    const adminExists = await Admin.findOne({ where: { email } });

    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create admin (hooks will hash password)
    const newAdmin = await Admin.create({
      name,
      email,
      password
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: newAdmin
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN ADMIN
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check admin in DB
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin
};
