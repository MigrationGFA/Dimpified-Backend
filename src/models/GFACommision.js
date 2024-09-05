const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");

const GFACommision = sequelize.define(
  "GFACommision",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ecosystemDomain: {
      type: DataTypes.STRING,
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
    tableName: "GFACommision",
    timestamps: false,
  }
);


module.exports = GFACommision;
