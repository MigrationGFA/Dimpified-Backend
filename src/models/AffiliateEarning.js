const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Affiliate = require("../models/Affiliate");

const AffiliateEarning = sequelize.define(
  "AffiliateEarning",
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
    tableName: "AffiliateEarning",
    timestamps: false,
  }
);

AffiliateEarning.belongsTo(Affiliate, {
  foreignKey: "affiliateId",
  targetKey: "id",
});

module.exports = AffiliateEarning;
