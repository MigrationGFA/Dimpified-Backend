const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Creator = require("./Creator");


const CreatorSocialProfile = sequelize.define(
    "EcosystemCreatorSocialProfile",
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
        tableName: "EcosystemCreatorSocialProfile",
    }
);

CreatorSocialProfile.belongsTo(Creator, { foreignKey: "userId" });

module.exports = CreatorSocialProfile;