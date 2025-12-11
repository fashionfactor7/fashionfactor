const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Broadcast = sequelize.define(
  "Broadcast",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true // optional, for future scheduling
    }
  },
  { timestamps: true }
);

module.exports = Broadcast;
