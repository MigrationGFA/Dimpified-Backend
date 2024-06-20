const express = require("express");
const router = express.Router();
const checkDomainAvailability = require("../controllers/EcosystemController/checkDomain");

// Endpoint to check domain availability
router.post("/check-domain", checkDomainAvailability);

module.exports = router;
