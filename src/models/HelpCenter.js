const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const User = require("./Users");

const HelpCenter = sequelize.define('HelpCenter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    UserId: {
        type: DataTypes.STRING,
        allowNull: true,
        // references: {
        //     model: 'User',
        //     key: 'id'
        // }
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

HelpCenter.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
module.exports = HelpCenter