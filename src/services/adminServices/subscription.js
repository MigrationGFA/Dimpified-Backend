const Subscription = require("../../models/Subscription");
const { sequelize } = require("../../config/dbConnect");
const { Op } = require("sequelize");
const {
  GetMonthlySubscriptions,
  GetPlanTypeAndTotalSubscription,
} = require("../../controllers/AdminController/procedure");

exports.allSubscription = async () => {
  const subscriptions = await Subscription.findAll({
    attributes: [
      "creatorId",
      "username",
      "planType",
      "ecosystemDomain",
      "amount",
      "createdAt",
      "status",
    ],
    order: [["createdAt", "DESC"]],
  });

  // Format subscriptions with separate date and time
  const formattedSubscriptions = subscriptions.map((subscription) => {
    const createdAt = new Date(subscription.createdAt);
    return {
      id: subscription.creatorId,
      username: subscription.username,
      planType: subscription.planType,
      ecosystemDomain: subscription.ecosystemDomain,
      amount: subscription.amount,
      status: subscription.status,
      date: createdAt.toISOString().split("T")[0], // Extract date (YYYY-MM-DD)
      time: createdAt.toISOString().split("T")[1].split(".")[0], // Extract time (HH:MM:SS)
    };
  });

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
