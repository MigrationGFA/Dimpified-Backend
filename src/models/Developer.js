const { sequelize } = require("../config/dbConnect");
const { DataTypes } = require("sequelize");

const Developer = sequelize.define(
  "Developer",
  {
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "developer",
    },
    passwordToken: DataTypes.STRING,
    passwordTokenExpirationDate: DataTypes.STRING,
    verificationToken: DataTypes.STRING,
  },
  {
    tableName: "Developer",
    timestamps: true,
  }
);

module.exports = Developer;
