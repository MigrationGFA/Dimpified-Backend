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

const {
  developerSignup,
  developerLogin,
  verifyEmailDeveloper,
  developerLogOut,
  forgotPasswordDeveloper,
  resetPasswordDeveloper,
} = require("../controllers/DeveloperController/registration");

const {
    authLimiter,
    resetPasswordLimiter, 
} = require("../middleware/RateLimiter")

// Ecosystem user endpoints
router.post("/ecosystem-user/register", Register);
router.post("/ecosystem-user/verify-email", verifyEmail);
router.post("/ecosystem-user/resend-email", resendEmail);
router.post("/ecosystem-user/login", Login);
router.post("/ecosystem-user/forgot-password", resetPasswordLimiter, forgotPassword);
router.post("/ecosystem-user/reset-password", resetPasswordLimiter, resetPassword);
router.delete("/ecosystem-user/logout/:userId", logout);

// creator endpoints
router.post("/creator/register", authLimiter, creatorRegister);
router.post("/onboarding", onBoarding);
router.post("/creator/login", creatorLogin);
router.delete("/creator/logout/:userId", creatorlogout);
router.post("/creator/resend-email", creatorResendEmail);
router.post("/creator/verify-email", creatorVerifyEmail);
router.post("/creator/forgot-password", resetPasswordLimiter, creatorForgotPassword);
router.post("/creator/reset-password", resetPasswordLimiter, creatorResetPassword);

//developer endpoints
router.post("/developer/registration", developerSignup);
router.post("/developer/login", developerLogin);
router.post("/developer/verify-email", verifyEmailDeveloper);
router.delete("/developer/logout/:userId", developerLogOut);
router.post("/developer/forgot-password", forgotPasswordDeveloper);
router.post("/developer/reset-password", resetPasswordDeveloper);

module.exports = router;
