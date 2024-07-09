const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const User = require("../models/EndUser");

const Review = sequelize.define(
  "Review",
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
    reviewedItemId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reviewedItemType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["Product", "Service", "Course"]],
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Review",
  }
);

// Define associations
Review.belongsTo(User, { foreignKey: "userId", targetKey: "id" });

module.exports = Review;
