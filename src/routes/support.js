const express = require("express");
const router = express.Router();
const supportController = require("../controllers/Support/support");

// Create a new support ticket
router.post("/create/support-ticket", supportController.createSupportTicket);

// Get all support tickets for a merchant (filtered by status)
router.get("/support-tickets/:ecosystemDomain", supportController.getMerchantSupportTickets);

// Get a single support ticket by ID
router.get("/support-ticket/:id", supportController.getSupportTicketById);

router.get("/support-box/:ecosystemDomain", supportController.getSupportBoxStats);


module.exports = router;
