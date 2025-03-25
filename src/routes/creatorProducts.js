const express = require("express");
const router = express.Router();
const authenticatedUser  = require("../middleware/authentication")
const ecosystemProduct = require("../controllers/creatorController/Products/service");

// create service booking
router.post("/create-service", 
  authenticatedUser,
  ecosystemProduct.createService);
  
router.get(
  "/get-all-services/:ecosystemDomain",
  ecosystemProduct.getAllServices
);
router.put(
  "/edit-service-details",
  authenticatedUser,
  ecosystemProduct.editServiceDetailsAndAddService
);
router.put("/edit-service", 
  authenticatedUser,
  ecosystemProduct.editSubService);

module.exports = router;
