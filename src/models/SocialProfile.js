const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const EcosystemUser = require("./EcosystemUser");

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
      allowNull: false,
      references: {
        model: EcosystemUser,
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

module.exports = SocialProfile;
