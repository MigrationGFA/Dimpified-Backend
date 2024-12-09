const Creator = require("../../models/Creator");
const { Op } = require("sequelize");
const Subscription = require("../../models/Subscription");
const Ecosystem = require("../../models/Ecosystem");
const CreatorProfile = require("../../models/CreatorProfile");
const {
  getAllUsers,
  getMonthlyRegistration,
} = require("../../controllers/AdminController/procedure");

exports.DashboardAllUsers = async () => {
  const allUsers = await Creator.count();

  const verifiedUsers = await Creator.count({
    where: { isVerified: true },
  });

  const unverifiedUsers = await Creator.count({
    where: { isVerified: false },
  });

  const unfinishedProfiles = await Creator.count({
    where: {
      step: { [Op.lt]: 5 },
    },
  });

  return {
    status: 200,
    data: {
      data: {
        allUsers,
        verifiedUsers,
        unverifiedUsers,
        unfinishedProfiles,
      },
    },
  };
};

exports.AdminSubscriptionCounts = async () => {
  const freePlanCount = await Subscription.count({
    where: {
      planType: "Lite",
    },
  });

  const paidPlanCount = await Subscription.count({
    where: {
      planType: {
        [Op.ne]: "Lite", // Not equal to "Lite"
      },
    },
  });

  return {
    status: 200,
    data: {
      message: "Plan counts retrieved successfully",
      freePlanCount,
      paidPlanCount,
    },
  };
};

exports.dashboardUsersInformation = async () => {
  // Fetch all creators with id, email, and isVerified status
  const creators = await Creator.findAll({
    attributes: ["id", "email", "isVerified"],
  });

  if (!creators.length) {
    return {
      status: 200,
      data: {
        allTheUsers: [],
        verifiedUsers: [],
        unVerifiedUsers: [],
      },
      message: "No creators found.",
    };
  }

  // Extract creator IDs
  const creatorIds = creators.map((creator) => creator.id);

  // Fetch profiles (fullName)
  const creatorProfiles = await CreatorProfile.find({
    creatorId: { $in: creatorIds },
  }).select("creatorId fullName phoneNumber");

  // Fetch ecosystems (ecosystemDomain)
  const ecosystems = await Ecosystem.find({
    creatorId: { $in: creatorIds },
  }).select("creatorId ecosystemDomain createdAt");

  // Map ecosystem domains to creatorId
  const ecosystemMap = ecosystems.reduce((map, ecosystem) => {
    if (!map[ecosystem.creatorId]) {
      map[ecosystem.creatorId] = [];
    }
    map[ecosystem.creatorId].push({
      domain: ecosystem.ecosystemDomain,
      createdAt: ecosystem.createdAt,
    });

    return map;
  }, {});

  // Map profiles to creators
  const profileMap = creatorProfiles.reduce((map, profile) => {
    map[profile.creatorId] = {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
    };
    return map;
  }, {});

  // Classify users into all, verified, and unverified
  const allTheUsers = creators.map((creator) => {
    return {
      id: creator.id,
      email: creator.email,
      name: profileMap[creator.id] || null,
      ecosystemDomains: ecosystemMap[creator.id] || [],
      isVerified: creator.isVerified,
    };
  });

  const verifiedUsers = allTheUsers.filter((user) => user.isVerified);
  const unVerifiedUsers = allTheUsers.filter((user) => !user.isVerified);

  // Return structured response
  return {
    status: 200,
    data: {
      allUsers,
      verifiedUsers,
      unVerifiedUsers,
    },
  };
};

exports.userStats = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error in /api/ecosystem-transactions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
};

exports.monthlyRegistration = async (req, res) => {
  try {
    const monthlyRegistration = await getMonthlyRegistration();
    res.status(200).json({
      success: true,
      data: monthlyRegistration,
    });
  } catch (error) {
    console.error("Error in /api/ecosystem-transactions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly registrations.",
    });
  }
};
