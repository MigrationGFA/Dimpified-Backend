const Creator = require("../../models/Creator");
const Rating = require("../../models/Rating");

const submitReview = async (req, res) => {
    await Rating.sync();
    try {
        const { userId, creatorId, adminId, rating, review } = req.body
        const details = [
            "creatorId",
            "adminId",
            "rating",
            "review",
        ]
        for (const detail of details) {
            if (!req.body[detail]) {
                return res.status(400).json({ message: `${detail} is required` });
            }
        }
        const newRating = await Rating.create({
            userId,
            creatorId,
            adminId,
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
                attributes: ["organizationName", "imageUrl"]
            }
        })
        res.status(200).json({ reviews })
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
}
module.exports = { submitReview, getAllReviews }