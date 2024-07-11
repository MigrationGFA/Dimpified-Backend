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
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

PurchasedItem.belongsTo(User, { foreignKey: "userId", targetKey: "id" });

module.exports = PurchasedItem;
