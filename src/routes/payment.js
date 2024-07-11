const express = require("express");
const router = express.Router();
const VerifyPayment = require("../controllers/PaymentController/payment");

router.post("/verify-payment", VerifyPayment);

module.exports = router;
