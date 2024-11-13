const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Affiliate = require("./Affiliate");

const AffiliateAccount = sequelize.define(
  "AffiliateAccount",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    affiliateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Affiliate",
        key: "id",
      },
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
    tableName: "AffiliateAccount",
  }
);

AffiliateAccount.belongsTo(Affiliate, {
  foreignKey: "affiliateId",
  targetKey: "id",
});

module.exports = AffiliateAccount;
