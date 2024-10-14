const express = require("express");
const {
  creatorSignup,
  verifyOTPCreator,
  getCreators,
  createBusinessDetails,
  forgotPassword,
  resetPassword,
  resendOTPCreator,
  verifyResetPasswordOtp,
} = require("../controllers/newAddition/authentication/resgistration");
const {
  creatorLogin,
} = require("../controllers/newAddition/authentication/login");
const {
  weeklyBookingStats,
  weeklyIncomeStats,
} = require("../controllers/newAddition/PaymentController/Statistics");
const authenticatedUser = require("../middleware/authentication");
const router = express.Router();

router.post("/creator/signup", creatorSignup);
router.post("/creator/sign-in", creatorLogin);
router.post("/creator/verify-otp", verifyOTPCreator);
router.post("/creator/business-details", createBusinessDetails);
router.get("/all-creators", getCreators);
router.post("/creator/forgot/password", forgotPassword);
router.post("/creator/verify-reset-otp", verifyResetPasswordOtp);
router.patch("/creator/reset/password", resetPassword);
router.post("/creator/resend-otp", resendOTPCreator);

// Statistics
router.get(
  "/booking-stats/:ecosystemDomain",
  authenticatedUser,
  weeklyBookingStats
);
router.get(
  "/income-stats/:ecosystemDomain",
  authenticatedUser,
  weeklyIncomeStats
);

module.exports = router;
