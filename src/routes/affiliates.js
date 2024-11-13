const express = require("express");
const router = express.Router();
const affiliateController = require("../controllers/affiliateController/Dashboard/Dashboard");
const affiliateEarningController = require("../controllers/affiliateController/Payment/Earning");
const AffiliateAccount = require("../controllers/affiliateController/Account/bank");
const Profile = require("../controllers/affiliateController/Dashboard/Profile");

const authenticatedUser = require("../middleware/authentication")

const multer = require("multer");
const storage = multer.diskStorage({});
const upload = multer({ storage });

router.get(
  "/affiliate-dashboard-stats/:affiliateId",
  authenticatedUser,
  affiliateController.getAffiliateDashboardstat
);

router.get(
  "/affiliate-last-four-onboarded-users/:affiliateId",
  authenticatedUser,
  affiliateController.getLastFourOnboardedUsers
);

router.get(
  "/affiliate-all-onboarded-users/:userId",
  authenticatedUser,
  affiliateController.allAffiliateOnboardUsers
);
router.get(
  "/affiliate-onboarded-users-blocks/:affiliateId",
  authenticatedUser,
  affiliateController.affiliateUserBlocks
);

router.get(
  "/affiliate-last-four-subscribe-users/:affiliateId",
  authenticatedUser,
  affiliateController.getLastFourSubscribeUsers
);

// Affiliate Withdrawal Request
router.post(
  "/affiliate-withdrawal-request",
  authenticatedUser,
  affiliateEarningController.affiliateWithdrawalRequest
);

// Get  affiliate withdrawal-Request

router.get(
  "/affiliate-withdrawal-requests/:affiliateId",
  authenticatedUser,
  affiliateEarningController.getAffiliateWithdrawalRequest
);

//Get Afiliate Earning
//Affiliate - Earning

router.get(
  "/affiliate-earning/:affiliateId",
  authenticatedUser,
  affiliateEarningController.getAffiliateEarning
);

// Affiliate-Earning-History
router.get(
  "/affiliate-earning-history/:affiliateId",
  authenticatedUser,
  affiliateEarningController.affiliateEarningHistory
);

// Save Affiliate Account
router.post(
  "/affiliate/add-my-account",
  authenticatedUser,
  AffiliateAccount.saveAffiliateBankDetails
);

//Get Affiliate Account
router.get(
  "/affiliate/get-my-account/:affiliateId",
  authenticatedUser,
  AffiliateAccount.getAffiliateBankDetails
);

// Edit Affiliate Account
router.put(
  "/affiliate/edit-my-account",
  authenticatedUser,
  AffiliateAccount.editAffiliateBankDetails
);

// Get Affiiliate Total withdrawals Stats

router.get(
  "/affiliate-total-withdrawals-stats/:affiliateId",
  authenticatedUser,
  affiliateEarningController.affiliateTotalWithdrawalStats
);

//Affiliate endpoint
router.put("/affiliate/profile",
  authenticatedUser,
  upload.single("image"),
  Profile.createAffiliateProfile);

router.get("/get-affiliate-profile/:affiliateId",
  authenticatedUser,
  Profile.getAffiliateProfile);

module.exports = router;
