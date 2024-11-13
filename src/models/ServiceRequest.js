const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const EcosystemUser = require("./EcosystemUser");

const ServiceRequest = sequelize.define(
  "EcosystemServiceRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ecosystemDomain: { type: DataTypes.STRING, required: true },
    ecosystemUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: EcosystemUser,
        key: "id",
      },
    },
    fromDate: { type: DataTypes.DATE, allowNull: false },
    toDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    proposedTime: {
      type: DataTypes.STRING,
    },
    notes: { type: DataTypes.STRING, allowNull: false },
    numberOfRequests: { type: DataTypes.INTEGER, allowNull: false },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "unpaid",
      validate: {
        isIn: [["paid", "unpaid"]],
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["ongoing", "completed", "pending"]],
      },
    },
  },
  {
    tableName: "EcosystemServiceRequest",
  }
);

ServiceRequest.belongsTo(EcosystemUser, { foreignKey: "ecosystemUserId" });

module.exports = ServiceRequest;
