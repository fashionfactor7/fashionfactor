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
      defaultValue: "pending", // pending, paid, failed
    },

    reference: {
      type: DataTypes.STRING,
      unique: true,
    },

    cartItems: {
      type: DataTypes.JSON,
      allowNull: false,
    }
  },
  { timestamps: true }
);

module.exports = Order;
