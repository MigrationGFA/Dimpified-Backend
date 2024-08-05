const Ecosystem = require("../../../models/Ecosystem");
const Creator = require("../../../models/Creator")
const DigitalProduct = require("../../../models/DigitalProduct")
const Course = require("../../../models/Course");
const Service = require("../../../models/Service")
const EcosystemUser = require("../../../models/EcosystemUser");
const CreatorSupport = require("../../../models/Support");
const Template = require("../../../models/Templates");

//const PurchasedItem = require("../../../models/PurchasedItem");



const getAdminAllEcosystem = async (req, res) => {
    try {
        const ecosystems = await Ecosystem.find().sort({ createdAt: -1 });

        const ecosystemsWithLogos = await Promise.all(
            ecosystems.map(async (ecosystem) => {
                const template = await Template.findOne({ ecosystemId: ecosystem._id });
                return {
                    ...ecosystem.toObject(),
                    logo: template ? template.navbar.logo : null,
                };
            })
        );

        res.status(200).json({ ecosystemsWithLogos });
    } catch (error) {
        console.error("Error retrieving ecosystems:", error);
        res.status(500).json({ message: "Internal server error" });
    };
};

// Get pending (draft) ecosystems
const getPendingEcosystems = async (req, res) => {
    try {
        const pendingEcosystems = await Ecosystem.find({ status: 'draft' }).sort({ createdAt: -1 });

        const ecosystemsWithLogos = await Promise.all(
            pendingEcosystems.map(async (ecosystem) => {
                const template = await Template.findOne({ ecosystemId: ecosystem._id });
                return {
                    ...ecosystem.toObject(),
                    logo: template ? template.navbar.logo : null,
                };
            })
        );
        res.status(200).json({ ecosystemsWithLogos });
    } catch (error) {
        console.error("Error retrieving pending ecosystems:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get completed (live) ecosystems
const getCompletedEcosystems = async (req, res) => {
    try {
        const completedEcosystems = await Ecosystem.find({ status: 'live' }).sort({ createdAt: -1 });
        const ecosystemsWithLogos = await Promise.all(
            completedEcosystems.map(async (ecosystem) => {
                const template = await Template.findOne({ ecosystemId: ecosystem._id });
                return {
                    ...ecosystem.toObject(),
                    logo: template ? template.navbar.logo : null,
                };
            })
        );
        res.status(200).json({ ecosystemsWithLogos });
    } catch (error) {
        console.error("Error retrieving completed ecosystems:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllCreators = async (req, res) => {
    try {
        const creators = await Creator.findAll({
            order: [['createdAt', 'DESC']]
        })
        const creatorDetails = await Promise.all(creators.map(async creator => {

            const [ecosystems, digitalProducts, services, courses] = await Promise.all([
                Ecosystem.find({ creatorId: creator.id }),
                DigitalProduct.find({ creatorId: creator.id }),
                Service.find({ creatorId: creator.id }),
                Course.find({ creatorId: creator.id }),

            ]);

            // Fetch users associated with the ecosystems of the creator
            const userCountPromises = ecosystems.map(async ecosystem => {
                if (ecosystem.ecosystemDomain) {
                    const users = await EcosystemUser.findAll({
                        where: { ecosystemDomain: ecosystem.ecosystemDomain }
                    });
                    return users.length;
                }
                return 0;
            });

            const userCounts = await Promise.all(userCountPromises);
            const totalUserCount = userCounts.reduce((sum, count) => sum + count, 0);


            const ecosystemsWithLogos = await Promise.all(
                ecosystems.map(async (ecosystem) => {
                    const template = await Template.findOne({ ecosystemId: ecosystem._id });
                    return {
                        ...ecosystem.toObject(),
                        logo: template ? template.navbar.logo : null,
                    };
                })
            );

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
                userCount: totalUserCount,
                ecosystems: ecosystemsWithLogos
            };

        }));

        res.status(200).json({ creators: creatorDetails })

    } catch (error) {
        console.error("Error retrieving all creators:", error);
        res.status(500).json({ message: 'Server error' });
    };
};


const getACreatorById = async (req, res) => {
    try {
        const id = req.params.id;

        const creator = await Creator.findByPk(id, {
            order: [['createdAt', 'DESC']]
        });

        if (!creator) {
            return res.status(404).json({ error: 'Creator not found' });
        }
        // Fetch all related ecosystems and products by creator
        const [ecosystems, digitalProducts, services, courses] = await Promise.all([
            Ecosystem.find({ creatorId: id }),
            DigitalProduct.find({ creatorId: id }),
            Service.find({ creatorId: id }),
            Course.find({ creatorId: id })
        ]);

        res.json({
            id: creator.id,
            organizationName: creator.organizationName,
            email: creator.email,
            isVerified: creator.isVerified,
            imageUrl: creator.imageUrl,
            numberOfTargetAudience: creator.numberOfTargetAudience,
            categoryInterest: creator.categoryInterest,
            role: creator.role,
            courses,
            ecosystems,
            digitalProducts,
            services,

        });

    } catch (error) {
        console.error("Error retrieving creator:", error);
        res.status(500).json({ error: 'Failed to fetch creator' });
    }
};

const getAllSupportRequests = async (req, res) => {
    try {
        const allSupportRequests = await CreatorSupport.findAll({
            order: [['createdAt', 'DESC']],

            include: [
                {
                    model: Creator,
                    attributes: ['organizationName', 'email', 'imageUrl']
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

const getAdminDashboardOverview = async (req, res) => {
    try {
        const totalEcosystem = await Ecosystem.countDocuments()

        const totalUsers = await Creator.count()

        const totalSupportRequest = await CreatorSupport.count()

        const dashboardData = {
            totalEcosystem: totalEcosystem,
            totalUsers: totalUsers,
            totalSupportRequest: totalSupportRequest,
        };
        res.status(200).json({ dashboardData });
    } catch (error) {
        console.error("Error retrieving support requests:", error);
        res.status(500).json({ message: 'Server error' });
    }
}


module.exports = {
    getAdminAllEcosystem,
    getPendingEcosystems,
    getCompletedEcosystems,
    getAllCreators,
    getACreatorById,
    getAllSupportRequests,
    getAdminDashboardOverview
};