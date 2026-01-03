const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },

  // 🔥 CRITICAL FOR NEON
  pool: {
    max: 1,        // only one connection
    min: 0,        // allow shutdown
    idle: 5000,    // close idle connections fast
    acquire: 30000
  }
});

module.exports = sequelize;
