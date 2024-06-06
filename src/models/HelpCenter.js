const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const EndUser = require("./EndUser");


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
    // role: {
    //     type: DataTypes.ENUM("Creator"),
    //     allowNull: false

    // },
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
    },
    ecosystemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
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
module.exports = HelpCenter