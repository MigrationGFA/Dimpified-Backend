const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Creator = require("./Creator");

const Rating = sequelize.define("Rating", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // userId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    // },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    review: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
},
    {
        tableName: "Rating",
    }
)
Rating.belongsTo(Creator, { foreignKey: "creatorId", targetKey: "id" });

module.exports = Rating;