const { DATEONLY } = require("sequelize");
const Ecosystem = require("../../models/Ecosystem");


exports.getStoreByCountry = async () => {
  try {
    const storeByCountry = await Ecosystem.aggregate([
      {
        $group: {
          _id: "$country", 
          storeCount: { $sum: 1 }, 
        },
      },
      {
        $project: {
          country: "$_id",
          storeCount: 1,
          _id: 0, 
        },
      },
    ]);

    return {
      status: 200,
      data: storeByCountry, 
    };
  } catch (error) {
    console.error("Error fetching stores by country:", error);
    return { status: 500, data: { error: "Internal Server Error" } };
  }
};

exports.getStoreByDate = async (params) => {
  const { date } = params;
  
  if (!date) {
    return {
      status: 400,
      data: {
        message: "date is required",
      },
    };
  }

  try {
    // Step 1: Determine date range based on the provided date parameter
    let dateRange = {};

    if (date === 'day') {
      
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      dateRange = { createdAt: { $gte: startOfDay, $lte: endOfDay } };
    } else if (date === 'month') {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      dateRange = { createdAt: { $gte: startOfMonth, $lte: endOfMonth } };
    } else if (date === 'year') {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
      dateRange = { createdAt: { $gte: startOfYear, $lte: endOfYear } };
    } else if (date === 'all time') {
      // No date range, fetch all data
      dateRange = {};
    } else {
      return {
        status: 400,
        data: {
          message: "Invalid date parameter. Use 'day', 'month', 'year', or 'all time'.",
        },
      };
    }

    // Step 2: Fetch unique stores (categories) from MongoDB, considering the date range
    const categories = await Ecosystem.aggregate([
      { $match: dateRange }, // Filter by the date range
      { $group: { _id: "$mainObjective", storeCount: { $sum: 1 } } },
      { $project: { category: "$_id", storeCount: 1, _id: 0 } }
    ]);

    return {
      status: 200,
      data: categories,
    };
  } catch (error) {
    console.error("Error fetching store data by date:", error);
    return { status: 500, data: { error: "Internal Server Error" } };
  }
};
