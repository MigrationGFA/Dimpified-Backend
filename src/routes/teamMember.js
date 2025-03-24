const express = require("express");
const teamController = require("../controllers/creatorController/teamMember");

const router = express.Router();

// Add a new team member
router.post("/add-team-member", teamController.addTeamMember);

// Team member onboarding
router.post("/onboard-team-member", teamController.onboardTeamMember);

// Get all team members (filtered by ecosystemDomain)
router.get("/get-team-members/:ecosystemDomain", teamController.getTeamMembers);

// Delete (deactivate) a team member
router.delete(
  "/delete-team-member/:teamMemberId",
  teamController.deleteTeamMember
);

module.exports = router;
