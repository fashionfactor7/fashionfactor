const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Category = require("./Category");

const Product = sequelize.define(
  "Product",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },

    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  { timestamps: true }
);

// Relationship
Product.belongsTo(Category, { foreignKey: "categoryId" });

module.exports = Product;
