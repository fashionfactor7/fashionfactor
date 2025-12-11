const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Newsletter = sequelize.define(
  "Newsletter",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  { timestamps: true }
);

module.exports = Newsletter;
