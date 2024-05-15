const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  "dimpified",
  // process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PWD,
  {
    dialect: "mysql",
    host: process.env.HOST,
    port: process.env.DB_PORT,
    pool: {
      max: 100,
      min: 0,
      acquire: 1000000,
      idle: 100000,
      evict: 2000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the MySQL Server with Sequelize");
  } catch (error) {
    console.error("Error connecting to server with Sequelize:", error);
  }
};

module.exports = { sequelize, connectDB };
