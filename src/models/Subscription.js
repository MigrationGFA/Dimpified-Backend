const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Creator = require("../models/Creator");

const Subscription = sequelize.define(
  "Subscription",
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
    username: {
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
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sizeLimit: {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    interval: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Subscription",
    timestamps: true,
  }
);

Subscription.belongsTo(Creator, { foreignKey: "creatorId" });

module.exports = Subscription;
