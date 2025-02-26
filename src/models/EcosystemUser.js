const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");

const EcosystemUser = sequelize.define(
  "EcosystemUser",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ecosystemDomain: {
      type: DataTypes.STRING,
      allowNull: false,
    },
   
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
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
     dob: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    imageUrl: DataTypes.STRING,
    passwordToken: DataTypes.STRING,
    passwordTokenExpirationDate: DataTypes.STRING,
    verificationToken: DataTypes.STRING,
  },
  {
    tableName: "EcosystemUser",
  }
);

module.exports = EcosystemUser;
