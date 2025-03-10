const express = require("express");
const router = express.Router();
const supportController = require("../controllers/Support/support");
const authenticatedUser = require("../middleware/authentication");



// Create a new support ticket
router.post("/create/support-ticket", supportController.createSupportTicket);

// Get all support tickets for a merchant (filtered by status)
router.get(
  "/support-tickets/:ecosystemDomain",authenticatedUser,
  supportController.getMerchantSupportTickets
);

// Get a single support ticket by ID
router.get("/support-ticket/:id",
authenticatedUser,
 supportController.getSupportTicketById);

router.get(
  "/support-box/:ecosystemDomain",authenticatedUser,
  supportController.getSupportBoxStats
);

//reply ticket
router.post("/reply-ticket",authenticatedUser, supportController.replyToSupportTicket);

module.exports = router;
