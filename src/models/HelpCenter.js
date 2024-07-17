const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const EndUser = require("./EcosystemUser");
const Creator = require("./Creator");



const HelpCenter = sequelize.define('HelpCenter', {
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
    // creatorId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true,
    // },
    ecosystemDomain: { type: DataTypes.STRING, required: true },
    status: {
        type: DataTypes.ENUM("pending", "completed"),
        allowNull: false,
        defaultValue: "pending",
    },
},
    {
        tableName: "HelpCenter",
        timestamps: true,
    }
)

HelpCenter.belongsTo(EndUser, { foreignKey: "userId", targetKey: "id" });
HelpCenter.belongsTo(Creator, { foreignKey: "creatorId", targetKey: "id" });
module.exports = HelpCenter