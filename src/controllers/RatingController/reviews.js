const Product = require("../../models/Product");
const Service = require("../../models/Service");
const Course = require("../../models/Course");
const Review = require("../../models/Reviews");
const Ecosystem = require("../../models/Ecosystem");
const EcosystemUser = require("../../models/EcosystemUser");


const createReviews = async (req, res) => {
  const {
    userId,
    reviewedItemId,
    reviewedItemType,
    rating,
    review,
    ecosystemDomain,
  } = req.body;

  if (
    !userId ||
    !ecosystemDomain ||
    !reviewedItemId ||
    !reviewedItemType ||
    rating === undefined
  ) {
    return res.status(400).json({
      error:
        "userId, reviewedItemId, reviewedItemType, and rating are required",
    });
  }

  const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
  if (!ecosystem) {
    return res.status(404).json({ message: "Ecosystem not found" });
  }

  // Get the creatorId from the ecosystem
  const creatorId = ecosystem.creatorId;

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
    await Review.sync();
    const newReview = await Review.create({
      userId,
      reviewedItemId,
      reviewedItemType,
      rating,
      review,
      ecosystemDomain,
      creatorId
    });
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviews = async (req, res) => {
  const { reviewedItemId } = req.params;

  if (reviewedItemId) {
    return res.status(400).json({ error: "Invalid reviewedItemId" });
  }
  try {
    const reviews = await Review.findAll({
      where: {
        reviewedItemId,
        reviewedItemType: 'Product'
      },
      order: [["createdAt", "DESC"]],
    });

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'No reviews found for this product.' });
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({ message: "Failed to fetch product reviews" });
  }
};

const getEcosystemReview = async (req, res) => {
  try {

    const ecosystemDomain = req.params.ecosystemDomain
    if (!ecosystemDomain) {
      return res.status(404).json({ message: "EcosystemDomain is required" })
    }

    const ecosystemReviews = await Review.findAll({
      where: { ecosystemDomain },

      order: [['createdAt', 'DESC']]

    })
    res.status(200).json({ ecosystemReviews })
  } catch (error) {
    console.error("Error fetching ecosystem reviews:", error);
    res.status(500).json({ message: "Failed to fetch ecosystem reviews" });
  };

};

const getAUserReview = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(404).json({ message: "userId is required" })
    }
    const userReview = await Review.findAll({
      where: {
        userId
      },
      include: {
        model: EcosystemUser,
        attributes: ['username', 'imageUrl'],
      },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ userReview });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ message: "Failed to fetch user reviews" });
  };
};

module.exports = {
  createReviews,
  getReviews,
  getEcosystemReview,
  getAUserReview
};
