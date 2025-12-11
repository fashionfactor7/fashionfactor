const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Category = sequelize.define(
  "Category",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    description: {
      type: DataTypes.STRING
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  { timestamps: true }
);

module.exports = Category;
