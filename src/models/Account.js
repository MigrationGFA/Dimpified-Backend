const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Creator = require("../models/Creator");

const Account = sequelize.define(
  "Account",
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
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.ENUM("USD", "NGN"),
      allowNull: false,
      defaultValue: "NGN",
    },
  },
  {
    tableName: "Account",
  }
);
Account.belongsTo(Creator, { foreignKey: "creatorId", targetKey: "id" });

module.exports = Account;
