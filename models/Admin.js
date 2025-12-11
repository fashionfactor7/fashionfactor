const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/sequelize");

const Admin = sequelize.define(
  "Admin",
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

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: "admin"
    }
  },
  {
    timestamps: true,
    hooks: {
      async beforeCreate(admin) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
      },

      async beforeUpdate(admin) {
        if (admin.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      }
    }
  }
);

// Password comparison method
Admin.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = Admin;
