const express = require("express");
const {
  popularEcosystems,
  allEcosystemUsers,
  usersPerEcosystem,
  lastFourEcosystems
} = require("../controllers/CreatorController/CreatorDashboard");
const router = express.Router();

router.get("/top-ecosystems/:creatorId", popularEcosystems);
router.get("/last-four-ecosystems/:creatorId", lastFourEcosystems);
router.get("/all-ecosystem-users/:creatorId", allEcosystemUsers);
router.get("/ecosystem-users", usersPerEcosystem);

module.exports = router;
