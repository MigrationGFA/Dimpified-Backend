const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const User = require("./Users");

const Token = sequelize.define(
  "Token",
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
Token.belongsTo(User, { foreignKey: "userId", targetKey: "id" });

module.exports = Token;
