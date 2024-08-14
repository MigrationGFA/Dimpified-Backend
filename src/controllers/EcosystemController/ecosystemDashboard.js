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
   if (!ecosystemDomain) {
      return res.status(400).json({ message: "ecosystemDomain is required" });
    }
  try {
    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(400).json({ message: "Ecosystem not found" });
    }

    const createCommunity = ecosystem.communityCreated

    const transactions = await PurchasedItem.findAll({
      where: {
        ecosystemDomain,
      },
    });

    let totalNaira = 0;
    let totalDollar = 0;
    transactions.forEach((transaction) => {
      if (transaction.currency === "NGN") {
        totalNaira += transaction.itemAmount;
      } else if (transaction.currency === "USD") {
        totalDollar += parseFloat(transaction.itemAmount);
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
      createCommunity
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
    });

    const purchasedItemsPerMonth = productOrder.reduce((acc, item) => {
      const purchaseDate = new Date(item.purchaseDate);
      const monthName = purchaseDate.toLocaleString("default", {
        month: "long",
      });
      acc[monthName] = (acc[monthName] || 0) + 1;
      return acc;
    }, {});

    const allMonths = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(0, index);
      return date.toLocaleString("default", { month: "long" });
    });

    const allPurchasedItemsPerMonths = allMonths.map((month) => ({
      month,
      totalPurchasedItems: purchasedItemsPerMonth[month] || 0,
    }));

    res.status(200).json({
      allPurchasedItemsPerMonths,
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

const bestSellingProducts = async (req, res) => {
  try {
    const ecosystemDomain = req.params.ecosystemDomain;

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const top4Items = await PurchasedItem.findAll({
      where: { ecosystemDomain },
      attributes: [
        "itemId",
        "itemType",
        [Sequelize.fn("COUNT", Sequelize.col("itemId")), "purchaseCount"],
      ],
      group: ["itemId", "itemType"],
      order: [[Sequelize.literal("purchaseCount"), "DESC"]],
      limit: 4,
      raw: true,
    });

    const itemDetailsPromises = top4Items.map(async (item) => {
      let itemDetails;

      if (item.itemType === "Product") {
        itemDetails = await Product.findById(item.itemId);
      } else if (item.itemType === "Service") {
        itemDetails = await Service.findById(item.itemId);
      } else if (item.itemType === "Course") {
        itemDetails = await Course.findById(item.itemId);
      } else {
        throw new Error("Invalid item type");
      }

      return itemDetails
        ? { ...itemDetails.toJSON(), purchaseCount: item.purchaseCount }
        : null;
    });

    const detailedItems = await Promise.all(itemDetailsPromises);

    res.status(200).json({
      top4Items: detailedItems.filter((item) => item !== null),
    });
  } catch (error) {
    console.error("Error fetching top items:", error);
    res.status(500).json({ message: "Failed to fetch top items" });
  }
};

module.exports = {
  getAllEcosystemProduct,
  getAllEcosystemStudent,
  getOrders,
  ecosystemDashboard,
  getProductOrder,
  bestSellingProducts,
};
