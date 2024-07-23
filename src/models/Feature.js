const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Creator = require("./Creator");


const Feature = sequelize.define("Feature", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    featureName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    featureType: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    featureDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
},
    {
        tableName: "Feature",
        timestamps: true,
    }
)
Feature.belongsTo(Creator, { foreignKey: "creatorId", targetKey: "id" })

module.exports = Feature
