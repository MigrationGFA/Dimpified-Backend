const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");

const AdminUser = sequelize.define(
  "AdminUser",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    fullName: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "customerCare",
    },
  },
  {
    tableName: "AdminUser",
  }
);



module.exports = AdminUser;
