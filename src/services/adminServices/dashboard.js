const Creator = require("../../models/Creator");
const { Op } = require("sequelize");
const Subscription = require("../../models/Subscription");
const Ecosystem = require("../../models/Ecosystem");
const CreatorProfile = require("../../models/CreatorProfile");
const ecosystemTransaction = require("../../models/ecosystemTransaction");
const {
  getAllUsers,
  getMonthlyRegistration,
  getTotalSubscription
} = require("../../controllers/AdminController/procedure");
const CreatorEarning = require("../../models/CreatorEarning");
const Service = require("../../models/Service");
const { sequelize } = require("../../config/dbConnect");

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

  console.log(creatorProfiles);

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
// exports.getAuserInformations = async (params) => {
//   const { creatorId } = params;

//   if (!creatorId) {
//     return {
//       status: 400,
//       data: {
//         message: "creatorId is required",
//       },
//     };
//   }

//   const [creator, creatorProfile, ecosystems, subscription, balance] =
//     await Promise.all([
//       Creator.findOne({
//         where: { id: creatorId },
//         attributes: ["id", "email", "password"],
//       }),
//       CreatorProfile.findOne({
//         where: { creatorId },
//         attributes: [
//           "fullName",
//           "phoneNumber",
//           "state",
//           "localGovernment",
//           "country",
//         ],
//       }),
//       Ecosystem.find({ creatorId }).select("ecosystemDomain createdAt address"),
//       Subscription.findOne({ where: { creatorId }, attributes: ["planType"] }),
//       CreatorEarning.findOne({ where: { creatorId }, attributes: ["Naira"] }),
//     ]);

//   if (!creator) {
//     return {
//       status: 404,
//       data: {
//         message: "Creator not found",
//       },
//     };
//   }

//   const response = {
//     id: creator.id,
//     email: creator.email,
//     password: creator.password, // Exclude this if not needed
//     fullName: creatorProfile.fullName,
//     phoneNumber: creatorProfile.phoneNumber,
//     state: creatorProfile.state,
//     localGovernment: creatorProfile.localGovernment,
//     country: creatorProfile.country,
//     ecosystems: (ecosystems || []).map((eco) => ({
//       domain: eco.ecosystemDomain,
//       address: eco.address,
//       createdAt: eco.createdAt,
//     })),
//     subscription: subscription ? subscription.planType : null,
//     balance: balance ? balance.Naira : null,
//   };

//   return {
//     status: 200,
//     data: response,
//   };
// };

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

  const [creator, creatorProfile, ecosystems, subscription, totalBalance] =
    await Promise.all([
      Creator.findOne({
        where: { id: creatorId },
        attributes: ["id", "email", "step"],
      }),
      CreatorProfile.findOne(
        { creatorId }, // Query by creatorId in MongoDB
        "fullName phoneNumber" // Select specific fields
      ),
      Ecosystem.find({ creatorId }).select(
        "ecosystemDomain localgovernment createdAt address state country"
      ), // Query by creatorId in MongoDB and select fields
      Subscription.findOne({ where: { creatorId }, attributes: ["planType"] }),
      ecosystemTransaction.sum("amount", {
        where: { creatorId, status: "completed" }, // Only completed transactions
      }),
    ]);


  if (!creator) {
    return {
      status: 404,
      data: {
        message: "Creator not found",
      },
    };
  }
  console.log("this is subscription", subscription)
  const response = {
    id: creator.id,
    email: creator.email,
    step: creator.step,
    fullName: creatorProfile?.fullName || "N/A",
    phoneNumber: creatorProfile?.phoneNumber || "N/A",
    ecosystems: (ecosystems || []).map((eco) => ({
      domain: eco.ecosystemDomain,
      address: eco.address,
      state: eco.state || "N/A",
      localGovernment: eco.localgovernment || "N/A",
      country: eco.country || "N/A",
      createdAt: eco.createdAt,
    })),
    subscription: subscription ? subscription.planType : null,
    balance: totalBalance ? parseFloat(totalBalance).toFixed(2) : "0.00", // Default to "0.00"
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

exports.getSubCategory = async (query) => {
  const { subCategory, interval } = query;
  if (!subCategory || !interval) {
    return {
      status: 400,
      data: {
        message: "subCategory and interval are required.",
      },
    };
  }

  const now = new Date();
  let startDate;

  switch (interval) {
    case "weekly":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "monthly":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "yearly":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      return {
        status: 400,
        data: {
          message: "Invalid interval. Use 'weekly', 'monthly', or 'yearly'.",
        },
      };
  }

  // Query the database with filters and count
  const serviceCount = await Service.countDocuments({
    subCategory,
    createdAt: { $gte: startDate },
  });

  return {
    status: 200,
    data: {
      subCategory,
      interval,
      count: serviceCount,
    },
  };
};

exports.subCategoryInformation = async () => {
  // Fetch all creators
  const creators = await Creator.findAll();

  // Fetch all creator profiles
  const creatorProfiles = await CreatorProfile.find({});

  // Fetch all ecosystems
  const ecosystems = await Ecosystem.find({});

  // Fetch all subscriptions
  const subscriptions = await Subscription.findAll();

  // Fetch all transactions
  const transactions = await ecosystemTransaction.findAll();

  // Map creator details along with their subscriptions, ecosystem domain, and balance
  const creatorDetails = await Promise.all(
    creators.map(async (creator) => {
      const creatorProfile = creatorProfiles.find(
        (profile) => profile.creatorId === creator.id.toString()
      );

      const ecosystem = ecosystems.find((eco) => eco.creatorId === creator.id);

      const creatorSubscriptions = subscriptions.filter(
        (subscription) => subscription.creatorId === creator.id
      );

      // Get unique subscription plan types
      const uniquePlanTypes = [
        ...new Set(
          creatorSubscriptions.map((subscription) => subscription.planType)
        ),
      ].join(", "); // Combine as a comma-separated string

      // Calculate the balance from transactions
      const creatorTransactions = transactions.filter(
        (transaction) => transaction.creatorId === creator.id
      );
      const balance = creatorTransactions.reduce(
        (total, transaction) => total + parseFloat(transaction.amount || 0),
        0
      );

      return {
        id: creator.id, // Include creator ID
        creatorName: creatorProfile?.fullName || creator.organizationName,
        ecosystemDomain: ecosystem ? ecosystem.ecosystemDomain : "N/A",
        subscriptionPlan: uniquePlanTypes, // Comma-separated string of plan types
        balance: parseFloat(balance).toFixed(2), // Balance calculated from transactions
        date: creator.createdAt.toISOString().split("T")[0],
        time: creator.createdAt.toISOString().split("T")[1].split(".")[0],
        status: creator.step === 5 ? "Completed" : "In progress",
      };
    })
  );

  // Sort creator details in descending order
  const sortedCreatorDetails = creatorDetails.sort((a, b) => b.id - a.id);

  return {
    status: 200,
    data: {
      creatorAccount: sortedCreatorDetails,
    },
  };
};

exports.getAllCategory = async () => {
  try {
    // Calculate unique sectors
    const uniqueSectors = await Ecosystem.aggregate([
      {
        $group: {
          _id: "$targetAudienceSector", 
        },
      },
      {
        $count: "uniqueSectors", 
      },
    ]);

    const uniqueSectorCount = uniqueSectors[0]?.uniqueSectors || 0;

    // Calculate percentage change between months
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

    const [currentMonthData, lastMonthData] = await Promise.all([
      Ecosystem.aggregate([
        { $match: { createdAt: { $gte: currentMonthStart } } }, 
        { $group: { _id: "$targetAudienceSector" } }, 
        { $count: "uniqueSectors" }, 
      ]),
      Ecosystem.aggregate([
        { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } }, 
        { $group: { _id: "$targetAudienceSector" } }, 
        { $count: "uniqueSectors" }, 
      ]),
    ]);

    const currentMonthCount = currentMonthData[0]?.uniqueSectors || 0;
    const lastMonthCount = lastMonthData[0]?.uniqueSectors || 0;

    // Calculate percentage difference
    let percentageChange = 0;
    if (lastMonthCount > 0) {
      percentageChange = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
    }

    // Determine trend
    const trend = percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "no change";

    // Combine results
    return {
      status: 200,
      data: {
        uniqueSectorCount,
        percentageChange: percentageChange.toFixed(2),
        trend,
      },
    };
  } catch (error) {
    console.error("Error processing category data:", error);
    return { status: 500, data: { error: "Internal Server Error" } };
  }
};

exports.getAllStores = async () => {
  try {
    // Total number of stores
    const totalNumber = await Ecosystem.countDocuments();

    // Calculate percentage change between months
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

    // Count stores created in the current month and last month
    const [currentMonthCount, lastMonthCount] = await Promise.all([
      Ecosystem.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      Ecosystem.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    ]);

    // Calculate percentage difference
    let percentageChange = 0;
    if (lastMonthCount > 0) {
      percentageChange = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
    }

    const trend = percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "no change";

    // Combine results
    return {
      status: 200,
      data: {
        totalNumber,
        percentageChange: percentageChange.toFixed(2),
        trend,
      },
    };
  } catch (error) {
    console.error("Error fetching store data:", error);
    return { status: 500, data: { error: "Internal Server Error" } };
  }
};

exports.getTopStores = async () => {
  try {
    // Step 1: Fetch unique stores (categories) from MongoDB
    const categories = await Ecosystem.aggregate([
      { $group: { _id: "$mainObjective", storeCount: { $sum: 1 }, targetAudienceSector: { $first: "$targetAudienceSector" } } },
      { $project: { category: "$_id", storeCount: 1, _id: 0, targetAudienceSector: 1, _id: 0 } }
    ]);

    // Step 2: Fetch sales data from MySQL for each category
    const salesData = await Promise.all(
      categories.map(async (category) => {
        // Fetch all ecosystemDomains for the current category
        const ecosystemDomains = await Ecosystem.find(
          { mainObjective: category.category },
          { ecosystemDomain: 1, _id: 0 }
        ).lean();

        const ecosystemDomainList = ecosystemDomains.map((e) => e.ecosystemDomain);

        // Fetch total sales from MySQL for all related ecosystemDomains
        const [salesResult] = await sequelize.query(
          `SELECT SUM(amount) as totalSales 
           FROM ecoosystemtransactions 
           WHERE ecosystemDomain IN (:ecosystemDomainList)`,
          {
            replacements: { ecosystemDomainList },
            type: sequelize.QueryTypes.SELECT 
          }
        );

        return {
          category: category.category,
          targetAudienceSector: category.targetAudienceSector, 
          storeCount: category.storeCount,
          totalSales: salesResult.totalSales || 0,
        };
      })
    );

    // Step 3: Sort and return combined results
    return {
      status: 200,
      data: salesData.sort((a, b) => b.totalSales - a.totalSales),
    };
  } catch (error) {
    console.error("Error fetching top-selling categories:", error);
    return { status: 500, data: { error: "Internal Server Error" } };
  }
};

exports.getTotalSubscription = async (req, res) => {
  try {
    const users = await getTotalSubscription();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log("this is total sub state error", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch total sub stat.",
    });
  }
};
