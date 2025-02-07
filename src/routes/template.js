const express = require("express");
const router = express.Router();
const ecosystemTemplate = require("../controllers/CreatorController/Template/createTemplate");
const authenticatedUser  = require("../middleware/authentication")

router.get(
  "/getTemplate/:ecosystemDomain",
  ecosystemTemplate.getAnEcosystemTemplate
);

router.post("/create-template", 
  authenticatedUser,
  ecosystemTemplate.createNewTemplate);

router.post("/create/reserved-template", 

  ecosystemTemplate.createReservedTemplate);

router.get(
  "/reserved-template/:templateId",
  ecosystemTemplate.getReservedTemplate
);

router.put("/creator-edit-template/:ecosystemDomain",
   authenticatedUser,
   ecosystemTemplate.editCreatorTemplate);

module.exports = router;
