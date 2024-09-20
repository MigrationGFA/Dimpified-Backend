const express = require("express");
const {
  affiliateSignup,
  affiliateLogin,
  verifyEmailAffiliate,
  forgotPasswordAffiliate,
  resetPasswordAffiliate,
  affiliateLogOut,
  createAffiliateProfile,
  resendEmailAffiliate,
} = require("../controllers/AffiliateController/registration");
const router = express.Router();
const multer = require("multer");
const authenticatedUser = require("../middleware/authentication");
const upload = multer({ dest: "uploads/" });

const {
  authLimiter,
  resetPasswordLimiter,
} = require("../middleware/RateLimiter");

const {
  onboardUser,
  allAffiliateOnboardUsers,
  affiliateUserBlocks,
} = require("../controllers/AffiliateController/Onboarding");

const {
      withdrawalRequestAffiliate,
    getAffiliateWithdrawalRequests,
    affiliateTotalWithdrawalStats
} = require("../controllers/AffiliateController/affiliateWithdraw")

const {
      getAffiliateEarning,
    getAffiliateEarningHistory
} = require("../controllers/AffiliateController/affiliateEarning")


const {
   getAffiliateDashboardstat,
    getLastFourOnboardedUsers,
    getLastFourSubscribeUsers
} = require("../controllers/AffiliateController/affiliateDashboard")



router.post("/affiliate/signup", authLimiter, affiliateSignup);
router.post("/affiliate/login", authLimiter, affiliateLogin);
router.post(
  "/affiliate/verify-email",
  resetPasswordLimiter,
  verifyEmailAffiliate
);
router.delete("/affiliate/logout/:userId", authenticatedUser, affiliateLogOut);
router.post(
  "/affiliate/forgot-password",
  resetPasswordLimiter,
  forgotPasswordAffiliate
);
router.post(
  "/affiliate/reset-password",
  resetPasswordLimiter,
  resetPasswordAffiliate
);
router.post(
  "/affiliate/profile",
  upload.single("image"),
  authenticatedUser,
  createAffiliateProfile
);

router.post(
  "/affiliate/resend-email",
  resetPasswordLimiter,
  resendEmailAffiliate
);

// register users
router.post("/affiliate-onboard-creator",  onboardUser);
router.get("/affiliate-all-onboarded-users/:userId", authenticatedUser, allAffiliateOnboardUsers);
router.get(
  "/affiliate-onboarded-users-blocks/:affiliateId",
  authenticatedUser,
  affiliateUserBlocks
);

// earning
router.get("/affiliate-earning/:affiliateId", authenticatedUser, getAffiliateEarning);
router.get("/affiliate-earning-history/:affiliateId", authenticatedUser, getAffiliateEarningHistory);


// withdraw earning
router.post("/affiliate-withdrawal-request", authenticatedUser, withdrawalRequestAffiliate);
router.get("/affiliate-withdrawal-requests/:affiliateId", authenticatedUser, getAffiliateWithdrawalRequests);
router.get("/affiliate-total-withdrawals-stats/:affiliateId", authenticatedUser, affiliateTotalWithdrawalStats);

// dashboard
router.get("/affiliate-dashboard-stats/:affiliateId", authenticatedUser, getAffiliateDashboardstat);
router.get("/affiliate-last-four-onboarded-users/:affiliateId", authenticatedUser, getLastFourOnboardedUsers);
router.get("/affiliate-last-four-subscribe-users/:affiliateId", authenticatedUser, getLastFourSubscribeUsers);


module.exports = router;
