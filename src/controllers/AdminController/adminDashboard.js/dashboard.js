const Ecosystem = require("../../../models/Ecosystem");
const Creator = require("../../../models/Creator")
const DigitalProduct = require("../../../models/DigitalProduct")
const Course = require("../../../models/Course");
const Service = require("../../../models/Service")
const EcosystemUser = require("../../../models/EcosystemUser");
const CreatorSupport = require("../../../models/Support");


const getAdminAllEcosystem = async (req, res) => {
    try {
        const ecosystems = await Ecosystem.find().sort({ createdAt: -1 });
        res.status(200).json({ ecosystems });
    } catch (error) {
        console.error("Error retrieving ecosystems:", error);
        res.status(500).json({ message: "Internal server error" });
    };
};

// Get pending (draft) ecosystems
const getPendingEcosystems = async (req, res) => {
    try {
        const pendingEcosystems = await Ecosystem.find({ status: 'draft' }).sort({ createdAt: -1 });
        res.status(200).json({ pendingEcosystems });
    } catch (error) {
        console.error("Error retrieving pending ecosystems:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get completed (live) ecosystems
const getCompletedEcosystems = async (req, res) => {
    try {
        const completedEcosystems = await Ecosystem.find({ status: 'live' }).sort({ createdAt: -1 });
        res.status(200).json({ completedEcosystems });
    } catch (error) {
        console.error("Error retrieving completed ecosystems:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllCreators = async (req, res) => {
    try {
        const creators = await Creator.findAll()
        const creatorDetails = await Promise.all(creators.map(async creator => {

            const [ecosystems, digitalProducts, services, courses] = await Promise.all([
                Ecosystem.find({ creatorId: creator.id }),
                DigitalProduct.find({ creatorId: creator.id }),
                Service.find({ creatorId: creator.id }),
                Course.find({ creatorId: creator.id }),
            ]);

            return {
                id: creator.id,
                organizationName: creator.organizationName,
                email: creator.email,
                isVerified: creator.isVerified,
                imageUrl: creator.imageUrl,
                numberOfTargetAudience: creator.numberOfTargetAudience,
                categoryInterest: creator.categoryInterest,
                role: creator.role,
                ecosystemCount: ecosystems.length,
                digitalProductCount: digitalProducts.length,
                serviceCount: services.length,
                courseCount: courses.length,
                userCount: creator.userCount
            };

        }));

        res.status(200).json({ creatorDetails })

    } catch (error) {
        console.error("Error retrieving all creators:", error);
        res.status(500).json({ message: 'Server error' });
    };
};

const getAllSupportRequests = async (req, res) => {
    try {
        const allSupportRequests = await CreatorSupport.findAll({
            order: [['createdAt', 'DESC']],

            include: [
                {
                    model: Creator,
                    attributes: ['organizationName', 'email']
                },
            ],

        })

        res.status(200).json({
            success: true,
            data: allSupportRequests,
        });
    } catch (error) {
        console.error("Error retrieving support requests:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    getAdminAllEcosystem,
    getPendingEcosystems,
    getCompletedEcosystems,
    getAllCreators,
    getAllSupportRequests
};