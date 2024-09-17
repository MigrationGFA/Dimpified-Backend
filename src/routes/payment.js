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

router.post("/verify-payment", VerifyPayment);
router.post("/verify-booking-payment", verifyBookingPayment);
router.post("/verify-subscription", verifySubscription);

//ecosystemEarnings
router.get("/ecosystem-earnings/:ecosystemDomain", ecosystemEarnings);

// Creator Payment Details
router.post("/save-bank-details", saveCreatorAccount);
router.get("/bank-details/:ecosystemDomain", getCreatorBankDetails);
router.put("/edit-account", editCreatorAccount);

//Withdrawal routes
router.post("/withdrawal-request", withdrawalRequest);
router.get("/get-withdrawal-requests/:ecosystemDomain", getWithdrawalRequests);
router.get("/total-withdrawals-stats/:ecosystemDomain", totalWithdrawalStats);

// bank verification
router.get("/get-all-banks", getAllBanks);
router.post("/verify-bank-details", verifyBankDetails);

//Affiliae add accounts
router.post("/affiliate/add-my-account", saveAffiliateAccount);
router.get("/affiliate/get-my-account/:affiliateId", getAffiliateBankDetails);
router.put("/affiliate/edit-my-account", editAffiliateAccount);

module.exports = router;
