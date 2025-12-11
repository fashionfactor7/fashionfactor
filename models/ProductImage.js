const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Product = require("./Product");

const ProductImage = sequelize.define(
  "ProductImage",
  {
    public_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  { timestamps: true }
);

ProductImage.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(ProductImage, { foreignKey: "productId" });

module.exports = ProductImage;
