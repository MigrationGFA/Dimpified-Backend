const Subscription = require("../../models/Subscription");
const { sequelize } = require("../../config/dbConnect");
const { Op } = require("sequelize");
const {
  GetMonthlySubscriptions,
  GetPlanTypeAndTotalSubscription,
  getRevAndSubStat,
  getPlanTypeCount,
  getTotalSales
} = require("../../controllers/AdminController/procedure");
const Ecosystem = require("../../models/Ecosystem")
const SubscriptionTransaction = require("../../models/subscriptionTransaction")
const CreatorProfile = require("../../models/CreatorProfile")

exports.allSubscription = async () => {
  const subscriptions = await SubscriptionTransaction.findAll({
    attributes: [
      "creatorId",
      "planType",
      "ecosystemDomain",
      "amount",
      "createdAt",
      "status",
    ],
    order: [["createdAt", "DESC"]],
  });

  const ecosystems = await Ecosystem.find({}, { ecosystemDomain: 1, mainObjective: 1, _id: 0 }).lean();
    const ecosystemMap = ecosystems.reduce((map, ecosystem) => {
      map[ecosystem.ecosystemDomain] = ecosystem.mainObjective; // Map ecosystemDomain to mainObjective
      return map;
    }, {});

  // Format subscriptions with separate date and time
  const formattedSubscriptions = await Promise.all(
  subscriptions.map(async (subscription) => {
    const createdAt = new Date(subscription.createdAt);
    
    // Fetch creator profile asynchronously
    const creatorProfile = await CreatorProfile.findOne({ creatorId: subscription.creatorId });
    console.log("this is cretaor", creatorProfile)
    return {
      id: subscription.creatorId,
      username: creatorProfile.fullName,
      planType: subscription.planType,
      ecosystemDomain: subscription.ecosystemDomain,
      amount: subscription.amount,
      status: subscription.status,
      category: ecosystemMap[subscription.ecosystemDomain] || "Unknown",
      date: createdAt.toISOString().split("T")[0], 
      time: createdAt.toISOString().split("T")[1].split(".")[0], 
    };
  })
);


  // Group subscriptions by planType
  const groupedByPlanType = formattedSubscriptions.reduce(
    (acc, subscription) => {
      const { planType } = subscription;
      if (!acc[planType]) {
        acc[planType] = []; // Initialize array for new planType
      }
      acc[planType].push(subscription);
      return acc;
    },
    {}
  );

  // Include all subscriptions
  return {
    status: 200,
    data: {
      allSubscriptions: formattedSubscriptions,
      groupedByPlanType,
    },
  };
};

exports.totalSubscription = async () => {
  const planTypeCounts = await Subscription.findAll({
    attributes: [
      "planType",
      [sequelize.fn("COUNT", sequelize.col("planType")), "total"],
    ],
    group: ["planType"],
    where: {
      planType: {
        [Op.in]: ["Lite", "Plus", "Pro", "Extra"],
      },
    },
  });

  // Format response
  const formattedCounts = planTypeCounts.map((entry) => ({
    planType: entry.planType,
    total: parseInt(entry.dataValues.total, 10),
  }));

  // Ensure all planTypes are represented even if their count is 0
  const allPlanTypes = ["Lite", "Plus", "Pro", "Extra"];
  const result = allPlanTypes.map((type) => {
    const found = formattedCounts.find((entry) => entry.planType === type);
    return {
      planType: type,
      total: found ? found.total : 0,
    };
  });

  return {
    status: 200,
    data: {
      message: result,
    },
  };
};

exports.calculateTotalSubscription = async () => {
  const totalSubscriptions = await Subscription.count();

  // Respond with the total
  return {
    status: 200,
    data: {
      totalSubscription: totalSubscriptions,
    },
  };
};

exports.planTypeTotalSubscription = async (req, res) => {
  try {
    const supportCounts = await GetPlanTypeAndTotalSubscription();
    res.status(200).json({
      success: true,
      data: supportCounts,
    });
  } catch (error) {
    console.error("Error in /api/ecosystem-transactions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions.",
    });
  }
};

exports.monthlySubscriptions = async (req, res) => {
  try {
    const supportCounts = await GetMonthlySubscriptions();
    res.status(200).json({
      success: true,
      data: supportCounts,
    });
  } catch (error) {
    console.error("Error in /api/ecosystem-transactions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions.",
    });
  }
};


exports.getRevAndSubStat = async (req, res) => {
  const {date} = req.params
  if (!date) {
    return {
      status: 400,
      data: {
        message: "date is required",
      },
    };
  }
  try {
    console.log("this is date", `'${date}'`)
    const users = await getRevAndSubStat(`'${date}'`);
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log("this is total sub and revenue state error", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch total sub and revenue stat.",
    });
  }
};

exports.getPlanTypeCount = async (req, res) => {
  try {
    const plan = await getPlanTypeCount();
    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.log("this is plan type error", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch plan type stat.",
    });
  }
};

exports.getTotalSales = async (req, res) => {
  const {date} = req.params
  if (!date) {
    return {
      status: 400,
      data: {
        message: "date is required",
      },
    };
  }
  try {
    console.log("this is date", `'${date}'`)
    const users = await getTotalSales(`'${date}'`);
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log("this is total sales error", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch total sales stat.",
    });
  }
};