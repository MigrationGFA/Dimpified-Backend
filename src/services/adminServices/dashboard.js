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
  // Step 1: Fetch creators (id, email)
  const creators = await Creator.findAll({
    attributes: ["id", "email"],
  });

  if (!creators.length) {
    return { status: 200, data: [], message: "No creators found." };
  }

  // Extract creator IDs
  const creatorIds = creators.map((creator) => creator.id);

  // Step 2: Fetch profiles (phone number, full name)
  const creatorProfiles = await CreatorProfile.find({
    creatorId: { $in: creatorIds },
  }).select("creatorId fullName phoneNumber");

  if (!creatorProfiles.length) {
    return { status: 200, data: [], message: "No creator profiles found." };
  }

  // Step 3: Fetch ecosystems (ecosystemDomain and createdAt)
  const ecosystems = await Ecosystem.find({
    creatorId: { $in: creatorIds },
  }).select("creatorId ecosystemDomain createdAt");

  // Step 4: Map Ecosystem domains with createdAt to creatorId
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

  // Step 5: Map profiles to creators
  const profileMap = creatorProfiles.reduce((map, profile) => {
    map[profile.creatorId] = {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
    };
    return map;
  }, {});

  // Step 6: Build final response
  const formattedUsers = creators
    .filter((creator) => profileMap[creator.id]) // Only include creators with profiles
    .map((creator) => {
      const profile = profileMap[creator.id];
      return {
        email: creator.email,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        ecosystems: ecosystemMap[creator.id] || [], // Include domain and createdAt
      };
    });

  return {
    status: 200,
    data: formattedUsers,
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
