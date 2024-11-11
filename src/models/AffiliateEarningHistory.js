const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Affiliate = require("../models/Affiliate");
const Creator = require("../models/Creator");

const AffiliateEarningHistory = sequelize.define(
  "AffiliateEarningHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    affiliateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    planType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sizeLimit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    interval: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "AffiliateEarningHistory",
    timestamps: true,
  }
);

AffiliateEarningHistory.belongsTo(Affiliate, {
  foreignKey: "affiliateId",
  targetKey: "id",
});
AffiliateEarningHistory.belongsTo(Creator, {
  foreignKey: "userId",
  targetKey: "id",
});

module.exports = AffiliateEarningHistory;
