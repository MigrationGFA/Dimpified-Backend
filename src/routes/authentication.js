const express = require("express");
const router = express.Router();

const {
  Register,
  onBoarding,
} = require("../controllers/UserController/Authentication/register");
const verifyEmail = require("../controllers/UserController/Authentication/verifyEmail");
const resendEmail = require("../controllers/UserController/Authentication/resendEmail");
const Login = require("../controllers/UserController/Authentication/login");
const forgotPassword = require("../controllers/UserController/Authentication/forgotPassword");
const resetPassword = require("../controllers/UserController/Authentication/resetPassword");
const logout = require("../controllers/UserController/Authentication/logout");

router.post("/register", Register);
router.post("/onboarding", onBoarding);
router.post("/verify-email", verifyEmail);
router.post("/resend-email", resendEmail);
router.post("/login", Login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.delete("/logout/:userId", logout);

module.exports = router;
