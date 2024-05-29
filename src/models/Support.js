const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const User = require("./Users");

const CreatorSupport = sequelize.define('CreatorSupport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        // references: {
        //     model: 'User',
        //     key: 'id'
        // }
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
)

CreatorSupport.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
module.exports = CreatorSupport