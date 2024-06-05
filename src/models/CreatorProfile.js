const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");

const CreatorProfile = sequelize.define(
  "CreatorProfile",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Creator",
        key: "id",
      },
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "CreatorProfile",
  }
);

module.exports = CreatorProfile;
