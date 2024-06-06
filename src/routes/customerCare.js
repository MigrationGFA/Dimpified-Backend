const express = require("express");
const router = express.Router();

const {
  userContactUs,
  allContactUs,
  contactUsCompleted,
} = require("../controllers/CustomerCareController/contactUs");

const { userHelpCenter, getAllHelpRequest, helpRequestCompleted } = require("../controllers/CustomerCareController/helpCenter");
const { creatorSupport, getAllSupportRequest } = require("../controllers/CustomerCareController/support");


router.post("/contact-us", userContactUs);
router.get("/all-contact-us", allContactUs);
router.put("/contact-us/:id/completed", contactUsCompleted);


//End-Users Help center routes
router.post('/help-center', userHelpCenter)
router.get('/all-user-help-requests', getAllHelpRequest)
router.put("/help-center/completed/:requestId", helpRequestCompleted);

//Creator Support routes
router.post('/creator-support', creatorSupport);
router.get('/all-creator-support-requests', getAllSupportRequest)

module.exports = router;
