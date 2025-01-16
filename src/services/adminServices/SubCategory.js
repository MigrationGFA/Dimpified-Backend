const Ecosystem = require("../../models/Ecosystem");
const Subscription = require("../../models/Subscription");

exports.getASubcategory = async (params) => {
  const { subcategory } = params;

  if (!subcategory) {
    return {
      status: 400,
      data: {
        message: "subcategory is required",
      },
    };
  }

  try {
    // Step 1: Query to get ecosystems for the subcategory
    const ecosystems = await Ecosystem.find({ mainObjective: subcategory });

    if (!ecosystems || ecosystems.length === 0) {
      return {
        status: 404,
        data: {
          message: "No ecosystems found for the given subcategory",
        },
      };
    }

    // Step 2: Extract domain names
    const domainNames = ecosystems.map((ecosystem) => ecosystem.ecosystemDomain);

    const subscriptions = await Subscription.findAll({
      where: {
        ecosystemDomain: domainNames, 
      },
      order: [["createdAt", "DESC"]],
    });

    // Step 4: Return the results
    return {
      status: 200,
      data: subscriptions,
    };
  } catch (error) {
    console.error("Error in getASubcategory:", error);
    return {
      status: 500,
      data: {
        message: "An error occurred while processing your request",
        error: error.message,
      },
    };
  }
};
