const express = require("express");
const { createEcosystemUserResolution, getEcosystemResolutionRequest, getMyResolutionRequest, getCreatorResolutionRequest } = require("../controllers/CustomerCareController/Resolution");
const router = express.Router()

router.post("/create-resolution-request", createEcosystemUserResolution);
router.get("/ecosystem-resolution-request", getEcosystemResolutionRequest)
router.get("/my-resolution-request/:userId", getMyResolutionRequest)
router.get("/creator-resolution-request/:ecosystemDomain", getCreatorResolutionRequest)



module.exports = router