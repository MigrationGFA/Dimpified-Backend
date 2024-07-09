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
    password: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
  },
  {
    tableName: "Developer",
    timestamps: true,
  }
);

module.exports = Developer;
