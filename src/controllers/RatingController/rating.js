const Creator = require("../../models/Creator");
const Rating = require("../../models/Rating");

const submitReview = async (req, res) => {
    await Rating.sync();
    try {
        const { creatorId, rating, review } = req.body
        const details = [
            "creatorId",
            "rating",
            "review",
        ]
        for (const detail of details) {
            if (!req.body[detail]) {
                return res.status(400).json({ message: `${detail} is required` });
            }
        }
        const newRating = await Rating.create({
            creatorId,
            rating,
            review
        })

        res.status(200).json({
            message: "Thank you for your feedback",
            newRating,
        });


    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Rating.findAll({
            include: {
                model: Creator,
                attributes: ["id", "organizationName", "imageUrl", "email"]
            }
        })
        res.status(200).json({ reviews })
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};

const getReviewsByCreator = async (req, res) => {
    try {
        const creatorId = req.params.creatorId;
        const reviews = await Rating.findAll({
            where: { creatorId: creatorId },
            include: {
                model: Creator,
                attributes: ["organizationName", "imageUrl"],
            },
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({ reviews });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports = { submitReview, getAllReviews, getReviewsByCreator }