const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Affiliate = require("./Affiliate");
const AffiliateAccount = require("./AffiliateAccount");

const AffiliateWithdrawal = sequelize.define(
  "AffiliateWithdrawal",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
    requestedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "AffiliateAccount",
        key: "id",
      },
    },
    affiliateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Affiliate",
        key: "id",
      },
    },
  },
  {
    tableName: "affiliatewithdrawals",
  }
);

Affiliate.hasMany(AffiliateWithdrawal, { foreignKey: "affiliateId" });
AffiliateWithdrawal.belongsTo(Affiliate, { foreignKey: "affiliateId" });

AffiliateAccount.hasMany(AffiliateWithdrawal, { foreignKey: "accountId" });
AffiliateWithdrawal.belongsTo(AffiliateAccount, {
  foreignKey: "accountId",
});

module.exports = AffiliateWithdrawal;
