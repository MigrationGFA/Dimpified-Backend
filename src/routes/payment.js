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

// bank verification
const {
  getAllBanks,
  verifyBankDetails
} = require("../controllers/PaymentController/Bank")

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


module.exports = router;
