const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const EcosystemUser = require("./EcosystemUser");
const Creator = require("./Creator");


const SocialProfile = sequelize.define(
  "EcosystemSocialProfile",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ecosystemDomain: { type: DataTypes.STRING, required: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: EcosystemUser,
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
    twitter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    youtube: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LinkedIn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "EcosystemSocialProfile",
  }
);

SocialProfile.belongsTo(EcosystemUser, { foreignKey: "userId" });
SocialProfile.belongsTo(Creator, { foreignKey: "creatorId", targetKey: "id" });


module.exports = SocialProfile;
