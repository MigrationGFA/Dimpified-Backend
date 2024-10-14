const express = require("express");
const {
  creatorSignup,
  verifyOTPCreator,
  getCreators,
  createBusinessDetails,
  forgotPassword,
  resetPassword,
} = require("../controllers/newAddition/authentication/resgistration");
const {
  creatorLogin,
} = require("../controllers/newAddition/authentication/login");
const router = express.Router();

router.post("/creator/signup", creatorSignup);
router.post("/creator/sign-in", creatorLogin);
router.post("/creator/verify-otp", verifyOTPCreator);
router.post("/creator/business-details", createBusinessDetails);
router.get("/all-creators", getCreators);
router.post("/creator/forgot/password", forgotPassword);
router.patch("/creator/reset/password", resetPassword);

module.exports = router;
