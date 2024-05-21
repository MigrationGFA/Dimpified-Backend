const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");

const User = sequelize.define(
  "User",
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
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "creator",
    },
  },
  {
    tableName: "User",
  }
);

module.exports = User;
