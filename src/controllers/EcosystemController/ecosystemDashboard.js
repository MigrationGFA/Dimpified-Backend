const Course = require("../../models/Course");
const Ecosystem = require("../../models/Ecosystem");
const EcosystemUser = require("../../models/EcosystemUser");
const Service = require("../../models/Service");
const Product = require("../../models/DigitalProduct");
const Creator = require("../../models/Creator");
const Transaction = require("../../models/Transaction");
const { Sequelize, Op } = require("sequelize");
const CreatorEarning = require("../../models/CreatorEarning");
const { sequelize } = require("../../config/dbConnect");
const PurchasedItem = require("../../models/PurchasedItem");
const DigitalProduct = require("../../models/DigitalProduct");

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

const ecosystemDashboard = async (req, res) => {
  const ecosystemDomain = req.params.ecosystemDomain;

  try {
    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(400).json({ message: "Ecosystem not found" });
    }

    const creatorId = ecosystem.creatorId;
    const transactions = await Transaction.findAll({
      where: {
        creatorId,
      },
    });

    let totalNaira = 0;
    let totalDollar = 0;
    transactions.forEach((transaction) => {
      if (transaction.currency === "NGN") {
        totalNaira += parseFloat(transaction.amount);
      } else if (transaction.currency === "USD") {
        totalDollar += parseFloat(transaction.amount);
      }
    });

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    let courses = await Course.find({ ecosystemId: ecosystem._id });
    let coursesThisMonth = await Course.find({
      ecosystemId: ecosystem._id,
      createdAt: { $gte: startOfMonth },
    });

    let services = await Service.find({
      ecosystemDomain: ecosystem.ecosystemDomain,
    });
    let servicesThisMonth = await Service.find({
      ecosystemDomain: ecosystem.ecosystemDomain,
      createdAt: { $gte: startOfMonth },
    });

    let products = await Product.find({
      ecosystemDomain: ecosystem.ecosystemDomain,
    });
    let productsThisMonth = await Product.find({
      ecosystemDomain: ecosystem.ecosystemDomain,
      createdAt: { $gte: startOfMonth },
    });

    const totalCourses = {
      total: courses.length,
      thisMonth: coursesThisMonth.length,
    };
    const totalServices = {
      total: services.length,
      thisMonth: servicesThisMonth.length,
    };
    const totalProducts = {
      total: products.length,
      thisMonth: productsThisMonth.length,
    };
    const totalEarnings = { totalNaira, totalDollar };

    res.status(200).json({
      totalCourses,
      totalProducts,
      totalServices,
      totalEarnings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductOrder = async (req, res) => {
  const ecosystemDomain = req.params.ecosystemDomain;

  try {
    const productOrder = await PurchasedItem.findAll({
      where: { ecosystemDomain },
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
      const monthTransactions = productOrder.filter(
        (transaction) => transaction.month === index + 1
      );
      acc[month] = monthTransactions.length;
      return acc;
    }, {});

    res.status(200).json({
      productOrder: result,
    });
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

    const transactions = await PurchasedItem.findAll({
      where: { ecosystemDomain },
      attributes: ["itemId", "itemAmount", "purchaseDate", "itemType"],
      order: [["purchaseDate", "DESC"]],
    });

    const servicesPromises = transactions
      .filter((transaction) => transaction.itemType === "Service")
      .map(async (transaction) => {
        const service = await Service.findById(transaction.itemId);
        return {
          itemId: transaction.itemId,
          itemAmount: transaction.itemAmount,
          purchaseDate: transaction.purchaseDate,
          service,
        };
      });

    const productsPromises = transactions
      .filter((transaction) => transaction.itemType === "Product")
      .map(async (transaction) => {
        const product = await DigitalProduct.findById(transaction.itemId);
        return {
          itemId: transaction.itemId,
          itemAmount: transaction.itemAmount,
          purchaseDate: transaction.purchaseDate,
          product,
        };
      });

    const coursesPromises = transactions
      .filter((transaction) => transaction.itemType === "Course")
      .map(async (transaction) => {
        const course = await Course.findById(transaction.itemId);
        return {
          itemId: transaction.itemId,
          itemAmount: transaction.itemAmount,
          purchaseDate: transaction.purchaseDate,
          course,
        };
      });

    const services = await Promise.all(servicesPromises);
    const products = await Promise.all(productsPromises);
    const courses = await Promise.all(coursesPromises);

    res.status(200).json({
      services,
      products,
      courses,
    });
  } catch (error) {
    console.error("Error fetching orders data:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

module.exports = {
  getAllEcosystemProduct,
  getAllEcosystemStudent,
  getOrders,
  ecosystemDashboard,
  getProductOrder,
};
