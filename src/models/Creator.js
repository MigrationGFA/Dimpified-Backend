const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");

const Creator = sequelize.define(
  "Creator",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    organizationName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    imageUrl: DataTypes.STRING,
    passwordToken: DataTypes.STRING,
    passwordTokenExpirationDate: DataTypes.STRING,
    verificationToken: DataTypes.STRING,
    numberOfTargetAudience: DataTypes.STRING,
    categoryInterest: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    affiliateId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Users may not be affiliated
      references: {
        model: "Affiliate", // References the 'Affiliate' model
        key: "id",
      },
      onDelete: "SET NULL", // When an affiliate is deleted, set affiliateId to null
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "creator",
    },
    userCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdCourses: {
      type: DataTypes.JSON, // Updated to JSON type to store an array of course IDs
      allowNull: true,
      defaultValue: [],
    },
    step: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    transactionNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "Creator",
  }
);

module.exports = Creator;
