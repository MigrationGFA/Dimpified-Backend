const Creator = require("../../models/Creator");
const Feature = require("../../models/Feature");

const suggestFeatures = async (req, res) => {
    try {
        await Feature.sync()

        const { featureName, type, description, creatorId } = req.body

        const details = [
            "featureName",
            " type",
            "description",
            "creatorId"
        ]
        for (const detail of details) {
            if (!req.body[detail]) {
                return res.status(400).json({ message: `${detail} is required` });
            }
        }
        const creator = await Creator.findByPk(creatorId)

        if (!creator) {
            return res.status(404).json({ message: "creator not found" })
        }
        const newFeature = await Feature.create({
            featureName,
            type,
            description,
            creatorId
        });
        res.status(201).json({ message: 'Feature suggested successfully', feature: newFeature });
    } catch (error) {
        console.error('Error suggesting feature:', error);
        res.status(500).json({ message: 'Internal Server Error', detail: error });
    }
};

const getAllFeatures = async (req, res) => {
    try {
        const features = await Feature.findAll({
            include: [{
                model: Creator,
                attributes: ["organizationName", "imageUrl", "email"]
            }],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({ features });
    } catch (error) {
        console.error('Error fetching features:', error);
        res.status(500).json({ message: 'Internal Server Error', detail: error });
    }
};


module.exports = { suggestFeatures, getAllFeatures }