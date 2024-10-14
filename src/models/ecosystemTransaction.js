const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const User = require("../models/EcosystemUser");
const Creator = require("../models/Creator");

const ecosystemTransaction = sequelize.define("ecoosystemTransaction", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  itemId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ecosystemDomain: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  itemType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [["Product", "Service", "Course"]],
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Creator,
      key: "id",
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  itemTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

ecosystemTransaction.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
});
ecosystemTransaction.belongsTo(Creator, {
  foreignKey: "creatorId",
  targetKey: "id",
});

module.exports = ecosystemTransaction;
