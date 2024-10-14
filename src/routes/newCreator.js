const express = require("express");
const {
  creatorSignup,
  verifyOTPCreator,
  getCreators,
  createBusinessDetails,
} = require("../controllers/newAddition/authentication/resgistration");
const {
  creatorLogin,
} = require("../controllers/newAddition/authentication/login");
const {
  weeklyBookingStats,
  weeklyIncomeStats,
} = require("../controllers/newAddition/PaymentController/Statistics");
const router = express.Router();

router.post("/creator/signup", creatorSignup);
router.post("/creator/sign-in", creatorLogin);
router.post("/creator/verify-otp", verifyOTPCreator);
router.post("/creator/business-details", createBusinessDetails);
router.get("/all-creators", getCreators);

// Statistics
router.get("/booking-stats/:ecosystemDomain", weeklyBookingStats);
router.get("/income-stats/:ecosystemDomain", weeklyIncomeStats);

module.exports = router;
