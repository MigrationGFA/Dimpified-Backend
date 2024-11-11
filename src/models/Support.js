const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Creator = require("./Creator");

const CreatorSupport = sequelize.define(
  "CreatorSupport",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    ecosystemDomain: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
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
    status: {
      type: DataTypes.ENUM("pending", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    tableName: "CreatorSupport",
    timestamps: true,
  }
);

CreatorSupport.belongsTo(Creator, { foreignKey: "creatorId", targetKey: "id" });
module.exports = CreatorSupport;
