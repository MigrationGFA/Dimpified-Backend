const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Creator = require("../models/Creator");

const SubscriptionTransaction = sequelize.define(
  "SubscriptionTransaction",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Creator,
        key: "id",
      },
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    planCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    planType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "failed", "successful"),
      allowNull: false,
      defaultValue: "pending",
    },
    failureReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sizeLimit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ecosystemDomain: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "SubscriptionTransactions", // Optional, you can change table name
  }
);

SubscriptionTransaction.belongsTo(Creator, {
  foreignKey: "creatorId",
  targetKey: "id",
});

module.exports = SubscriptionTransaction;
