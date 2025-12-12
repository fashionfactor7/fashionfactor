const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Invoice = sequelize.define(
  "Invoice",
  {
    reference: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    customerName: {
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
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending", // "paid" | "failed"
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
    }
  },
  { timestamps: true }
);

module.exports = Invoice;