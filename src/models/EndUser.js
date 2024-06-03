const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");

const EndUser = sequelize.define(
  "EndUser",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ecosystemId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
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
  },
  {
    tableName: "EndUser",
  }
);

module.exports = EndUser;
