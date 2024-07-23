const express = require("express");
const {
  popularEcosystems,
  allEcosystemUsers,
  usersPerEcosystem,
  lastFourEcosystems,
  getCreatorById,
  updateCreator,
  usersPermonth,
  getEcosystemUsersStats
} = require("../controllers/CreatorController/CreatorDashboard");
const router = express.Router();

// dahboard overview
router.get("/top-ecosystems/:creatorId", popularEcosystems);
router.get("/last-four-ecosystems/:creatorId", lastFourEcosystems);
router.get("/ecosystem-users-per-month/:creatorId", usersPermonth);
router.get("/ecosystems-users-stats/:creatorId", getEcosystemUsersStats);



// my user
router.get("/all-ecosystem-users/:creatorId", allEcosystemUsers);
router.get("/ecosystem-users", usersPerEcosystem);

//Creator Endpoint
router.get("/get-creator/:id", getCreatorById)
router.put("/edit-creator/:id", updateCreator)

module.exports = router;
