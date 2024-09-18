const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnect");

const BarberContact = sequelize.define(
  "BarberContact",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lga: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    landmark: {
      type: DataTypes.STRING,
      allowNull: false,
    },
     consent: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: false,
    },
    latitude: {
    type: DataTypes.DECIMAL(9,6), 
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(9,6), 
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING, 
    allowNull: true,
    defaultValue: "",
  },
  },
  {
    tableName: "BarberContact",
  }
);

module.exports = BarberContact;
