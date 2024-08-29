const express = require("express");
const router = express.Router();

const verifySubscription = require("../controllers/PaymentController/Subscription");
const {
  saveCreatorAccount,
  getCreatorBankDetails,
  editCreatorAccount,
  getCreatorEarning,
} = require("../controllers/PaymentController/AccountController");
const {
  withdrawalRequest,
  getWithdrawalRequests,
  getMyWithdrawalRequests,
} = require("../controllers/PaymentController/withdrawalController");
const {
  VerifyPayment,
  verifyBookingPayment,
} = require("../controllers/PaymentController/payment");

router.post("/verify-payment", VerifyPayment);
router.post("/verify-booking-payment", verifyBookingPayment);
router.post("/verify-subscription", verifySubscription);

// Creator Payment Details
router.post("/save-bank-details", saveCreatorAccount);
router.get("/bank-details/:creatorId", getCreatorBankDetails);
router.put("/edit-account", editCreatorAccount);
router.get("/creator/earnings/:creatorId", getCreatorEarning);

//Withdrawal routes
router.post("/withdrawal-request", withdrawalRequest);
router.get("/get-withdrawal-requests", getWithdrawalRequests);
router.get("/get-my-withdrawal-requests/:creatorId", getMyWithdrawalRequests);

module.exports = router;
