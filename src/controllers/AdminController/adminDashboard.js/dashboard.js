const Ecosystem = require("../../../models/Ecosystem");
const Creator = require("../../../models/Creator")
const DigitalProduct = require("../../../models/DigitalProduct")
const Course = require("../../../models/Course");
const Service = require("../../../models/Service")
const EcosystemUser = require("../../../models/EcosystemUser");
const CreatorSupport = require("../../../models/Support");
const Template = require("../../../models/Templates");
const PurchasedItem = require("../../../models/PurchasedItem");
const Feature = require("../../../models/Feature")
const Review = require("../../../models/Reviews")

//Admin ecosystem overview
const getAdminDashboardEcosystemOverview = async (req, res) => {
    try {
        const totalEcosystem = await Ecosystem.countDocuments()

        const totalDratfEcoystems = await Ecosystem.countDocuments({ status: 'draft' })

        const totalLiveEcosystems = await Ecosystem.countDocuments({ status: 'live' })

        const totalPrivateEcosystems = await Ecosystem.countDocuments({ status: 'private' })

        const dashboardData = {
            totalEcosystem,
            totalDratfEcoystems,
            totalLiveEcosystems,
            totalPrivateEcosystems
        };
        res.status(200).json({ dashboardData });
    } catch (error) {
        console.error("Error retrieving ecosystem overview:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

//Get all ecosystem by admin
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

//Get last four ecosystems
const getAdminLastFourEcosystems = async (req, res) => {
    try {
        const lastcreated = await Ecosystem.find()
            .sort({
                createdAt: -1,
            })
            .limit(4);

        if (lastcreated.length === 0) {
            return res
                .status(404)
                .json({ message: "User has no created ecosystems" });
        }

        const lastFourEcosystemWithLogos = await Promise.all(
            lastcreated.map(async (ecosystem) => {
                const template = await Template.findOne({ ecosystemId: ecosystem._id });
                return {
                    ...ecosystem.toObject(),
                    logo: template ? template.navbar.logo : null,
                };
            })
        );

        res.status(200).json({ lastFourEcosystemWithLogos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", detail: error });
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


//Get a single ecosystem
const getEcosystemSingle = async (req, res) => {
    try {
        const ecosystemId = req.params.id

        const ecosystem = await Ecosystem.findById(ecosystemId)
            .populate('courses')
            .populate('ecoCertificate')
            .populate('templates')
            .populate('forms');

        if (!ecosystem) {
            return res.status(404).json({ message: 'Ecosystem not found' });
        }

        const courses = await Course.find({ ecosystemId: ecosystemId });
        const digitalProducts = await DigitalProduct.find({ ecosystemDomain: ecosystem.ecosystemDomain });
        const services = await Service.find({ ecosystemDomain: ecosystem.ecosystemDomain });


        const userCount = await EcosystemUser.count({ where: { ecosystemDomain: ecosystem.ecosystemDomain } });


        const totalAmount = await PurchasedItem.sum('itemAmount', { where: { ecosystemDomain: ecosystem.ecosystemDomain } });

        res.status(200).json({
            ecosystem,
            courses,
            digitalProducts,
            services,
            userCount,
            totalAmount,
        });

    } catch (error) {
        console.error("Error retrieving ecosystem:", error);
        res.status(500).json({ message: 'Oops its not you its us' });
    }
}


//Get last four products
const getAdminLastFourProducts = async (req, res) => {
    try {
        const lastFourCourses = await Course.find().sort({ createdAt: -1 }).limit(4);
        const lastFourDigitalProducts = await DigitalProduct.find().sort({ createdAt: -1 }).limit(4);
        const lastFourServices = await Service.find().sort({ createdAt: -1 }).limit(4);

        const products = [
            ...lastFourCourses,
            ...lastFourDigitalProducts,
            ...lastFourServices
        ].flatMap(product => {
            if (product.schema.path('title')) return { ...product.toObject(), type: 'course' };
            if (product.schema.path('productName')) return { ...product.toObject(), type: 'digitalProduct' };
            if (product.schema.path('header')) return { ...product.toObject(), type: 'service' };
        });

        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json(products.slice(0, 4));
    } catch (error) {
        console.error("Error getting last four products:", error);
        res.status(500).json({ message: 'Server error' });
    }
}


//Creator Overviews
const getAdminDashboardCreatorOverview = async (req, res) => {
    try {
        const totalCreators = await Creator.count();

        const totalVerifiedCreators = await Creator.count({ where: { isVerified: true } });
        const totalUnverifiedCreators = await Creator.count({ where: { isVerified: false } });

        // Get creators that have ecosystems
        const creatorsWithEcosystem = await Ecosystem.distinct('creatorId');
        const totalCreatorsWithEcosystem = creatorsWithEcosystem.length;

        const dashboardData = {
            totalCreators,
            totalVerifiedCreators,
            totalUnverifiedCreators,
            totalCreatorsWithEcosystem,
        };
        res.status(200).json({ dashboardData });
    } catch (error) {
        console.error("Error retrieving creator dashboard error:", error);
        res.status(500).json({ message: 'Oops I think the server is down' });
    }
}
//Get all creators
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

            };

        }));

        res.status(200).json({ creators: creatorDetails })

    } catch (error) {
        console.error("Error retrieving all creators:", error);
        res.status(500).json({ message: 'Server error' });
    };
};

//Get a creator
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

        const ecosystemsWithLogos = await Promise.all(
            ecosystems.map(async (ecosystem) => {
                const template = await Template.findOne({ ecosystemId: ecosystem._id });
                return {
                    ...ecosystem.toObject(),
                    logo: template ? template.navbar.logo : null,
                };
            })
        );

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
            digitalProducts,
            services,
            ecosystems: ecosystemsWithLogos
        });

    } catch (error) {
        console.error("Error retrieving creator:", error);
        res.status(500).json({ error: 'Failed to fetch creator' });
    }
};


//Get last four creator
const getAdminLastFourCreators = async (req, res) => {
    try {
        const lastFourCreator = await Creator.findAll({
            attributes: { exclude: ['password', 'passwordToken', 'verificationToken', 'passwordTokenExpirationDate'] },
            order: [['createdAt', 'DESC']],
            limit: 4
        })


        if (lastFourCreator.length === 0) {
            return res
                .status(404)
                .json({ message: "User has no created ecosystems" });
        }

        const lastFourCreatorWithLogos = await Promise.all(
            lastFourCreator.map(async (ecosystem) => {
                const template = await Template.findOne({ ecosystemId: ecosystem._id });
                return {
                    ...ecosystem.get({ plain: true }),
                    logo: template ? template.navbar.logo : null,
                };
            })
        );

        res.status(200).json({ lastFourCreatorWithLogos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", detail: error });
    }
};

//Get all support Request
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

// get admin support overview
const getAdminDashboardSupportOverview = async (req, res) => {
    try {
        const totalSupportRequests = await CreatorSupport.count();

        // const totalDratfEcoystems = await CreatorSupport.count({ status: 'draft' })

        const totalPendingSupportRequests = await CreatorSupport.count({
            where: {
                status: 'pending'
            }
        });
        const totalCompletedSupports = await CreatorSupport.count({
            where: {
                status: 'completed'
            }

        })

        const dashboardData = {
            totalSupportRequests,
            totalPendingSupportRequests,
            totalCompletedSupports,
            //totalPrivateEcosystems
        };
        res.status(200).json({ dashboardData });
    } catch (error) {
        console.error("Error retrieving ecosystem overview:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

//Get Admin Dashboard Overview
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

const getAllFeatures = async (req, res) => {
    try {
        const allFeatures = await Feature.findAll({
            order: [['createdAt', 'DESC']]
        })

        res.status(200).json({
            success: true,
            data: allFeatures,
        });
    } catch (error) {
        console.error("Error retrieving Features:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const allReviews = await Review.findAll({
            order: [['createdAt', 'DESC']]
        })

        res.status(200).json({
            success: true,
            data: allReviews,
        });
    } catch (error) {
        console.error("Error retrieving Reviews:", error);
        res.status(500).json({ message: 'Server error' });
    };

};
module.exports = {
    getAdminDashboardEcosystemOverview,
    getAdminAllEcosystem,
    getPendingEcosystems,
    getCompletedEcosystems,
    getAdminLastFourEcosystems,
    getEcosystemSingle,
    getAdminLastFourProducts,
    getAdminDashboardCreatorOverview,
    getAllCreators,
    getACreatorById,
    getAdminLastFourCreators,
    getAllSupportRequests,
    getAdminDashboardSupportOverview,
    getAdminDashboardOverview,
    getAllFeatures,
    getAllReviews
};