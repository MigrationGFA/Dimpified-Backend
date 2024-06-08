const Creator = require("../../models/Creator");
const Feature = require("../../models/Feature");


//The routes are in the ratingRoutes.js file

const suggestFeatures = async (req, res) => {
    try {
        await Feature.sync()

        const { featureName, featureType, featureDescription, creatorId } = req.body

        const details = [
            "featureName",
            "featureType",
            "featureDescription",
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
            featureType,
            featureDescription,
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
                attributes: ["organizationName", "imageUrl",]
            }],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({ features });
    } catch (error) {
        console.error('Error fetching features:', error);
        res.status(500).json({ message: 'Internal Server Error', detail: error });
    }
};

const getACreatorFeature = async (req, res) => {
    try {
        const creatorId = req.params.creatorId
        if (!creatorId) {
            return res.status(400).json({ message: "Missing creator ID" });
        }

        const featuresByCreator = await Feature.findAll({
            where: {
                creatorId: creatorId
            },
            include: [{
                model: Creator,
                attributes: ["organizationName", "imageUrl",]
            }],
            order: [['createdAt', 'DESC']],
        })
        res.status(200).json({ featuresByCreator })
    } catch (error) {
        console.error("erroe fetching features by a creator: ", error);
        res.status(500).json({ message: 'Internal Server Error', detail: error });
    }
};
module.exports = { suggestFeatures, getAllFeatures, getACreatorFeature }