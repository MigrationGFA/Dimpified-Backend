const Creator = require("../../models/Creator");
const { Op } = require("sequelize");
const Subscription = require("../../models/Subscription");
const Ecosystem = require("../../models/Ecosystem");
const CreatorProfile = require("../../models/CreatorProfile");
const creatorEarning = require("../../models/CreatorEarning");
const {
  getAllUsers,
  getMonthlyRegistration,
} = require("../../controllers/AdminController/procedure");
const CreatorEarning = require("../../models/CreatorEarning");

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
    order: [["createdAt", "DESC"]],
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

  // Fetch profiles (fullName, phoneNumber)
  const creatorProfiles = await CreatorProfile.find({
    creatorId: { $in: creatorIds },
  }).select("creatorId fullName phoneNumber");

  // Fetch ecosystems (ecosystemDomain, createdAt)
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

  // Prepare the user data
  const users = creators.map((creator) => {
    const profile = profileMap[creator.id] || {};
    const ecosystems = ecosystemMap[creator.id] || [];
    return {
      id: creator.id,
      email: creator.email,
      isVerified: creator.isVerified,
      fullName: profile.fullName || null,
      phoneNumber: profile.phoneNumber || null,
      ecosystems: ecosystems.map((eco) => ({
        domain: eco.domain,
        createdAt: eco.createdAt,
      })),
    };
  });

  // Separate verified and unverified users
  const verifiedUsers = users.filter((user) => user.isVerified);
  const unVerifiedUsers = users.filter((user) => !user.isVerified);

  // Return the response
  return {
    status: 200,
    data: {
      allUsers: users,
      verifiedUsers,
      unVerifiedUsers,
    },
  };
};
exports.getAuserInformations = async (params) => {
  const { creatorId } = params;

  if (!creatorId) {
    return {
      status: 400,
      data: {
        message: "creatorId is required",
      },
    };
  }

  // Fetch the creator details
  const creator = await Creator.findOne({
    where: { id: creatorId },
    attributes: ["id", "email", "password"],
  });

  if (!creator) {
    return {
      status: 404,
      data: {
        message: "Creator not found",
      },
    };
  }

  // Fetch the creator profile
  const creatorProfile = await CreatorProfile.findOne({
    where: { creatorId },
    attributes: [
      "fullName",
      "phoneNumber",
      "state",
      "localGovernment",
      "country",
    ],
  });

  const profileDetails = creatorProfile || {
    fullName: null,
    phoneNumber: null,
    state: null,
    localGovernment: null,
    country: null,
  };

  // Fetch ecosystems associated with the creator
  const ecosystems = await Ecosystem.find({
    creatorId: creatorId,
  }).select("ecosystemDomain createdAt address");

  // Fetch subscription details
  const subscription = await Subscription.findOne({
    where: { creatorId },
    attributes: ["planType"],
  });

  // Fetch balance details
  const balance = await CreatorEarning.findOne({
    where: { creatorId },
    attributes: ["Naira"],
  });

  // Prepare the structured response
  const response = {
    id: creator.id,
    email: creator.email,
    password: creator.password,
    fullName: profileDetails.fullName,
    phoneNumber: profileDetails.phoneNumber,
    state: profileDetails.state,
    localGovernment: profileDetails.localGovernment,
    country: profileDetails.country,
    ecosystems: ecosystems.map((eco) => ({
      domain: eco.ecosystemDomain,
      address: eco.address,
      createdAt: eco.createdAt,
    })),
    subscription: subscription ? subscription.planType : null,
    balance: balance ? balance.Naira : null,
  };

  return {
    status: 200,
    data: response,
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
