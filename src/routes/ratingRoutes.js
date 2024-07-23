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
} = require("../controllers/RatingController/reviews");

//Creator review to admin
router.post("/creator-submit-review", submitReview);
router.get("/all-creator-reviews", getAllReviews);
router.get("/get-reviews-by-creator/:creatorId", getReviewsByCreator);



// Ecosystem reviews
router.post("/ecosystem/create-reviews", createReviews);

module.exports = router;
