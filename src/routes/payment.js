const express = require("express");
const router = express.Router();

const verifySubscription = require("../controllers/PaymentController/Subscription");
const {
  saveCreatorAccount,
  getCreatorBankDetails,
  editCreatorAccount,
  ecosystemEarnings,
} = require("../controllers/PaymentController/AccountController");
const {
  withdrawalRequest,
  getWithdrawalRequests,
  totalWithdrawalStats,
} = require("../controllers/PaymentController/withdrawalController");
const {
  VerifyPayment,
  verifyBookingPayment,
} = require("../controllers/PaymentController/payment");
const {
  saveAffiliateAccount,
  getAffiliateBankDetails,
  editAffiliateAccount,
} = require("../controllers/AffiliateController/affiliateAccount");
// bank verification
const {
  getAllBanks,
  verifyBankDetails,
} = require("../controllers/PaymentController/Bank");

const 
  authenticatedUser
 = require("../middleware/authentication")

router.post("/verify-payment", VerifyPayment);
router.post("/verify-booking-payment", verifyBookingPayment);
router.post("/verify-subscription", verifySubscription);

//ecosystemEarnings
router.get("/ecosystem-earnings/:ecosystemDomain", authenticatedUser, ecosystemEarnings);

// Creator Payment Details
router.post("/save-bank-details", authenticatedUser, saveCreatorAccount);
router.get("/bank-details/:ecosystemDomain",authenticatedUser, getCreatorBankDetails);
router.put("/edit-account", authenticatedUser, editCreatorAccount);

//Withdrawal routes
router.post("/withdrawal-request", authenticatedUser, withdrawalRequest);
router.get("/get-withdrawal-requests/:ecosystemDomain", authenticatedUser, getWithdrawalRequests);
router.get("/total-withdrawals-stats/:ecosystemDomain", authenticatedUser, totalWithdrawalStats);

// bank verification
router.get("/get-all-banks",  getAllBanks);
router.post("/verify-bank-details",  verifyBankDetails);

//Affiliae add accounts
router.post("/affiliate/add-my-account", authenticatedUser, saveAffiliateAccount);
router.get("/affiliate/get-my-account/:affiliateId", authenticatedUser, getAffiliateBankDetails);
router.put("/affiliate/edit-my-account", authenticatedUser, editAffiliateAccount);

module.exports = router;
