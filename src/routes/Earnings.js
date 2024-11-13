const express = require("express");
const path = require("path");
const router = express.Router();
const paymentEarning = require("../controllers/creatorController/Payment/Earning");
const incomeStats = require("../controllers/creatorController/Payment/Earning");
const dailySuccessful = require("../controllers/creatorController/Payment/Earning");
const totalMonthlySales = require("../controllers/creatorController/Payment/Earning");
const transactionHistory = require("../controllers/creatorController/Payment/Earning");
const authenticatedUser  = require("../middleware/authentication")

// creator earning
router.get(
  "/ecosystem-earnings/:ecosystemDomain",
  authenticatedUser,
  paymentEarning.ecosystemEarning
);

router.get("/income-stats/:ecosystemDomain", incomeStats.incomeStats);
router.get(
  "/daily-successful/:ecosystemDomain",
  authenticatedUser,
  dailySuccessful.dailySuccessful
);

router.get(
  "/total-monthly-sales/:ecosystemDomain",
  authenticatedUser,
  totalMonthlySales.totalMonthlySales
);

router.get(
  "/transaction-history/:ecosystemDomain",
  authenticatedUser,
  transactionHistory.transactionHistory
);

module.exports = router;
