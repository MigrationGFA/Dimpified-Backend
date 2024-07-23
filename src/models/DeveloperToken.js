const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const Developer = require("./Developer");

const DeveloperToken = sequelize.define(
  "DeveloperToken",
  {
    accessToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessTokenExpiration: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    refreshTokenExpiration: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

// Define association
DeveloperToken.belongsTo(Developer, { foreignKey: "userId", targetKey: "id" });

module.exports = DeveloperToken;
