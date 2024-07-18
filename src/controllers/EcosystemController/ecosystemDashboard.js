const Course = require("../../models/Course");
const Ecosystem = require("../../models/Ecosystem");
const EcosystemUser = require("../../models/EcosystemUser");
const Service = require("../../models/Service");
const Product = require("../../models/DigitalProduct");
const Creator = require("../../models/Creator");
const Transaction = require("../../models/Transaction");
const { Sequelize, Op } = require("sequelize");

const getAllEcosystemProduct = async (req, res) => {
  try {
    const ecosystemDomain = req.params.ecosystemDomain;
    if (!ecosystemDomain) {
      return res.status(404).json({ message: "ecosystemDomain not found" });
    }
    const ecosystemProduct = await Ecosystem.findOne({ ecosystemDomain });

    if (!ecosystemProduct) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const courses = await Course.find({
      ecosystemId: ecosystemProduct._id,
    }).sort({ createdAt: -1 });

    const services = await Service.find({ ecosystemDomain }).sort({
      createdAt: -1,
    });
    const products = await Product.find({ ecosystemDomain }).sort({
      createdAt: -1,
    });

    res.json({
      courses,
      services,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllEcosystemStudent = async (req, res) => {
  const ecosystemDomain = req.params.ecosystemDomain;

  try {
    const ecosystemStudent = await Ecosystem.findOne({ ecosystemDomain });

    if (!ecosystemStudent) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const ecosystemUser = await EcosystemUser.findAll({
      where: {
        ecosystemDomain: ecosystemDomain,
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ ecosystemUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getRevenue = async (req, res) => {
  const ecosystemDomain = req.params.ecosystemDomain;

  try {
    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(400).json({ message: "Ecosystem not found" });
    }

    const creatorId = ecosystem.creatorId;
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(400).json({ message: "Creator not found" });
    }

    let courses = await Course.find({ ecosystemId: ecosystem._id });

    let services = await Service.find({
      ecosystemDomain: ecosystem.ecosystemDomain,
    });

    let products = await Product.find({
      ecosystemDomain: ecosystem.ecosystemDomain,
    });

    const totalCourses = { total: courses.length };
    const totalServices = { total: services.length };
    const totalProducts = { total: products.length };

    res.status(200).json({ totalCourses, totalProducts, totalServices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getOrders = async (req, res) => {
  const { ecosystemDomain } = req.params;

  try {
    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(400).json({ message: "Ecosystem not found" });
    }

    const creatorId = ecosystem.creatorId;

    const transactions = await Transaction.findAll({
      where: { creatorId },
      attributes: {
        include: [[Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"]],
      },
      order: [[Sequelize.fn("MONTH", Sequelize.col("createdAt")), "ASC"]],
      raw: true,
    });

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const result = months.reduce((acc, month, index) => {
      const monthTransactions = transactions.filter(
        (transaction) => transaction.month === index + 1
      );
      acc[month] = monthTransactions;
      return acc;
    }, {});

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching orders data:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = {
  getAllEcosystemProduct,
  getAllEcosystemStudent,
  getOrders,
  getRevenue,
};
