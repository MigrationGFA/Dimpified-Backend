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

//Creator review to admin
router.post("/creator-submit-review", submitReview);
router.get("/all-creator-reviews", getAllReviews);
router.get("/get-reviews-by-creator/:creatorId", getReviewsByCreator);



// Ecosystem reviews
router.post("/ecosystem/create-reviews", createReviews);
router.get("/get-product-reviews/:reviewedItemId", getReviews);
router.get("/ecosystem-reviews/:ecosystemDomain", getEcosystemReview,)
router.get("ecosystem-user-reviews/:userId", getAUserReview)

module.exports = router;
