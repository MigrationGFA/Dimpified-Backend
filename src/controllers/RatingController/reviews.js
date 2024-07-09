const Product = require("../../models/Product");
const Service = require("../../models/Service");
const Course = require("../../models/Course");
const Review = require("../../models/Reviews");
const Ecosystem = require("../../models/Ecosystem");

const createReviews = async (req, res) => {
  const {
    userId,
    reviewedItemId,
    reviewedItemType,
    rating,
    review,
    ecosystemId,
  } = req.body;

  if (
    !userId ||
    !ecosystemId ||
    !reviewedItemId ||
    !reviewedItemType ||
    rating === undefined
  ) {
    return res.status(400).json({
      error:
        "userId, reviewedItemId, reviewedItemType, and rating are required",
    });
  }

  const ecosystem = await Ecosystem.findById(ecosystemId);
  if (!ecosystem) {
    return res.status(404).json({ message: "Ecosystem not found" });
  }

  if (!["Product", "Service", "Course"].includes(reviewedItemType)) {
    return res.status(400).json({ error: "Invalid reviewedItemType" });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "Rating must be a number between 1 and 5" });
  }

  let reviewedItem;

  if (reviewedItemType === "Product") {
    reviewedItem = await Product.findById(reviewedItemId);
  } else if (reviewedItemType === "Service") {
    reviewedItem = await Service.findById(reviewedItemId);
  } else if (reviewedItemType === "Course") {
    reviewedItem = await Course.findById(reviewedItemId);
  }

  if (!reviewedItem) {
    return res.status(404).json({ error: `${reviewedItemType} not found` });
  }

  try {
    const newReview = await Review.create({
      userId,
      reviewedItemId,
      reviewedItemType,
      rating,
      review,
    });
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviews = async (req, res) => {
  const { reviewedItemType } = req.query;

  if (!["Product", "Service", "Course"].includes(reviewedItemType)) {
    return res.status(400).json({ error: "Invalid reviewedItemType" });
  }

  try {
    // Fetch reviews based on the reviewedItemType
    const reviews = await Review.findAll({
      where: { reviewedItemType },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createReviews,
  getReviews,
};
