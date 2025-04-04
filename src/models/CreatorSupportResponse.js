const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");
const CreatorSupport = require("./Support"); 
const Admin = require("./AdminUser")


const CreatorSupportResponse = sequelize.define("CreatorSupportResponse", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  creatorSupportId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CreatorSupport,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Admin,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  respondedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

CreatorSupport.hasMany(CreatorSupportResponse, {
  foreignKey: "creatorSupportId",
  onDelete: "CASCADE",
});

CreatorSupportResponse.belongsTo(CreatorSupport, {
  foreignKey: "creatorSupportId",
});

Admin.hasMany(CreatorSupportResponse, {
  foreignKey: "adminId",
  onDelete: "CASCADE",
});

CreatorSupportResponse.belongsTo(Admin, {
  foreignKey: "adminId",
});

module.exports = CreatorSupportResponse;
