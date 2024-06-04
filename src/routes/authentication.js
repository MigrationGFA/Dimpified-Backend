const express = require("express");
const router = express.Router();

const Register = require("../controllers/UserController/Authentication/register");
const verifyEmail = require("../controllers/UserController/Authentication/verifyEmail");
const resendEmail = require("../controllers/UserController/Authentication/resendEmail");
const Login = require("../controllers/UserController/Authentication/login");
const forgotPassword = require("../controllers/UserController/Authentication/forgotPassword");
const resetPassword = require("../controllers/UserController/Authentication/resetPassword");
const logout = require("../controllers/UserController/Authentication/logout");
const creatorlogout = require("../controllers/CreatorController/Authentication/logout");
const creatorLogin = require("../controllers/CreatorController/Authentication/login");
const creatorResendEmail = require("../controllers/CreatorController/Authentication/resendEmail");
const creatorVerifyEmail = require("../controllers/CreatorController/Authentication/verifyEmail");
const creatorForgotPassword = require("../controllers/CreatorController/Authentication/forgotPassword");
const creatorRegister = require("../controllers/CreatorController/Authentication/register");
const creatorResetPassword = require("../controllers/CreatorController/Authentication/resetPassword");
const onBoarding = require("../controllers/CreatorController/Authentication/onBoarding");

// // User endpoints
router.post("/user/register", Register);
router.post("/user/verify-email", verifyEmail);
router.post("/user/resend-email", resendEmail);
router.post("/user/login", Login);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/reset-password", resetPassword);
router.delete("/user/logout/:userId", logout);

// creator endpoints
router.post("/creator/register", creatorRegister);
router.post("/onboarding", onBoarding);
router.post("/creator/login", creatorLogin);
router.delete("/creator/logout/:userId", creatorlogout);
router.post("/creator/resend-email", creatorResendEmail);
router.post("/creator/verify-email", creatorVerifyEmail);
router.post("/creator/forgot-password", creatorForgotPassword);
router.post("/creator/reset-password", creatorResetPassword);

module.exports = router;
