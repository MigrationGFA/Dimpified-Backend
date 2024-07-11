const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const EcosystemUser = require("./EcosystemUser");

const EcosystemResolution = sequelize.define('EcosystemResolution', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
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
    // ecosystemId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true,
    // },
    status: {
        type: DataTypes.ENUM("pending", "completed"),
        allowNull: false,
        defaultValue: "pending",
    },
},
    {
        tableName: "EcoResolution",
        timestamps: true,
    }
);
EcosystemResolution.belongsTo(EcosystemUser, { foreignKey: "userId", targetKey: "id" });

module.exports = EcosystemResolution