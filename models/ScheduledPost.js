const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Product = require("./Product");

const ScheduledPost = sequelize.define(
  "ScheduledPost",
  {
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  { timestamps: true }
);

ScheduledPost.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(ScheduledPost, { foreignKey: "productId" });

module.exports = ScheduledPost;
