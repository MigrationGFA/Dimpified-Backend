const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Creator = require("./Creator");
const Account = require("./Account");

const WithdrawalRequest = sequelize.define(
  "WithdrawalRequest",
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
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Creator",
        key: "id",
      },
    },
  },
  {
    tableName: "withdrawals",
  }
);

Creator.hasMany(WithdrawalRequest, { foreignKey: "creatorId" });
WithdrawalRequest.belongsTo(Creator, { foreignKey: "creatorId" });

Account.hasMany(WithdrawalRequest, { foreignKey: "accountId" });
WithdrawalRequest.belongsTo(Account, { foreignKey: "accountId" });

module.exports = WithdrawalRequest;
