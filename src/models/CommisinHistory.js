const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");

const CommissionHistory = sequelize.define(
  "CommissionHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ecosystemDomain: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "CommissionHistories", // Updated table name to reflect the model name
  }
);

module.exports = CommissionHistory;
