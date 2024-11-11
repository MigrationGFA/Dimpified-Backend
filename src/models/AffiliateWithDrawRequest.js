const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Affiliate = require("./Affiliate");
const Account = require("./AffiliateAccount");

const AffiliateWithdrawalRequest = sequelize.define(
  "AffiliateWithdrawalRequest",
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
    ecosystemDomain: {
      type: DataTypes.STRING,
      allowNull: false,
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
        model: "Account",
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
    tableName: "AffiliateWithdrawalRequest",
  }
);

Affiliate.hasMany(AffiliateWithdrawalRequest, { foreignKey: "affiliateId" });
AffiliateWithdrawalRequest.belongsTo(Affiliate, { foreignKey: "affiliateId" });

Account.hasMany(AffiliateWithdrawalRequest, { foreignKey: "accountId" });
AffiliateWithdrawalRequest.belongsTo(Account, { foreignKey: "accountId" });

module.exports = AffiliateWithdrawalRequest;
