const express = require("express");
const {
  popularEcosystems,
} = require("../controllers/CreatorController/CreatorDashboard");
const router = express.Router();

router.get("/top-ecosystems/:creatorId", popularEcosystems);

module.exports = router;
