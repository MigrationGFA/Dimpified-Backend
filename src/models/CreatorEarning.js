const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const User = require("../models/EcosystemUser");

const CreatorEarning = sequelize.define(
  "CreatorEarning",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Naira: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0, // Ensure a default value is set
    },
    Dollar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "CreatorEarning",
    timestamps: false,
  }
);

CreatorEarning.belongsTo(User, { foreignKey: "userId", targetKey: "id" });

module.exports = CreatorEarning;
