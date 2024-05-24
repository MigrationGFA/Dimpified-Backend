const express = require("express");
const router = express.Router();

const {
  userContactUs,
  allContactUs,
  contactUsCompleted,
} = require("../controllers/CustomerCareController/contactUs");

const { userHelpCenter, getAllHelpRequest, helpRequestCompleted } = require("../controllers/CustomerCareController/helpCenter")

router.post("/contact-us", userContactUs);
router.get("/all-contact-us", allContactUs);
router.put("/contact-us/:id/completed", contactUsCompleted);


//Help center routes
router.post('/help-center', userHelpCenter)
router.get('/get-all-help-request', getAllHelpRequest)
router.put("/help-center/:requestId/completed", helpRequestCompleted);

module.exports = router;
