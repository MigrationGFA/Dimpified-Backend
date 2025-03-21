const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const User = require("../models/EcosystemUser");

const PurchasedItem = sequelize.define("PurchasedItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
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
  itemId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  itemAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
},
  {
    tableName: "PurchasedItem", // Specify the exact table name
  },
);


PurchasedItem.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
});

module.exports = PurchasedItem;
