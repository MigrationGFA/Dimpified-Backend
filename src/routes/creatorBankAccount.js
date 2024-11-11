const express = require("express");
const router = express.Router();
const creatorBankAccount = require("../controllers/creatorController/Payment/Bank")
const authenticatedUser  = require("../middleware/authentication")

router.get("/get-all-banks", authenticatedUser, creatorBankAccount.getAllBanks);
router.post("/verify-bank-details",
     authenticatedUser,
     creatorBankAccount.verifyBankDetails);

router.get("/bank-details/:ecosystemDomain", 
     authenticatedUser,
    creatorBankAccount.getCreatorBankDetails);

router.post("/save-bank-details", 
     authenticatedUser,
    creatorBankAccount.saveCreatorAccount);

module.exports = router
