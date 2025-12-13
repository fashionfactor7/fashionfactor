const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Order = sequelize.define(
  "Order",
  {
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },

    reference: {
      type: DataTypes.STRING,
      unique: true,
    },

    cartItems: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    // 🔥 ADMIN FIELDS
    seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    seenAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { timestamps: true }
);

module.exports = Order;

