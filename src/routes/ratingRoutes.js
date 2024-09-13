const express = require("express");
const router = express.Router();

const {
  submitReview,
  getAllReviews,
  getReviewsByCreator,
} = require("../controllers/RatingController/rating");


const {
  createReviews,
  getReviews,
  getEcosystemReview,
  getAUserReview,
} = require("../controllers/RatingController/reviews");

const 
  authenticatedUser
 = require("../middleware/authentication")

//Creator review to admin
router.post("/creator-submit-review", authenticatedUser, submitReview);
router.get("/all-creator-reviews", authenticatedUser, getAllReviews);
router.get("/get-reviews-by-creator/:creatorId", authenticatedUser, getReviewsByCreator);



// Ecosystem reviews
router.post("/ecosystem/create-reviews", authenticatedUser, createReviews);
router.get("/get-product-reviews/:reviewedItemId",  getReviews);
router.get("/ecosystem-reviews/:ecosystemDomain", authenticatedUser, getEcosystemReview,)
router.get("/ecosystem-user-reviews/:userId", authenticatedUser, getAUserReview)

module.exports = router;
