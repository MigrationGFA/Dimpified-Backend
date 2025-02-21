const {
  GetGMV,
  GetNMV,
  GetAmountPaid,
  GetUnpaidAmount,
  GetTransactionIncome,
  GetTotalWithdrawals,
  GetTransactionsPro,
  GetSubscriptionDetails,
  GetCommissions,
  GetWithdrawals,
} = require("../../controllers/AdminController/procedure");

exports.getGMV = async (req, res) => {
  try {
    const result = await GetGMV();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/get-gmv:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch GMV.",
    });
  }
};

exports.getNMV = async (req, res) => {
  try {
    const result = await GetNMV();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/get-nmv:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch NMV.",
    });
  }
};

exports.getAmountPaid = async (req, res) => {
  try {
    const result = await GetAmountPaid();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/get-amount-paid:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch amount paid.",
    });
  }
};

exports.getUnpaidAmount = async (req, res) => {
  try {
    const result = await GetUnpaidAmount();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/get-unpaid-amount:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unpaid amount.",
    });
  }
};

exports.getTransactionIncome = async (req, res) => {
  try {
    const result = await GetTransactionIncome();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/get-transaction-income:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction income.",
    });
  }
};

exports.getTotalWithdrawals = async (req, res) => {
  try {
    const result = await GetTotalWithdrawals();
    console.log("results2:", result);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/get-total-withdrawals:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch total withdrawals.",
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { filterType, year, month, day } = req.query;

    // Get the current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed
    const currentDay = currentDate.getDate();

    // Set default values based on filterType
    const filters = {
      filterType: filterType || "alltime",
      year: filterType === "alltime" ? 0 : parseInt(year) || currentYear, // Use current year if not provided
      month:
        filterType === "month" || filterType === "day"
          ? parseInt(month) || currentMonth
          : 0, // Use current month for 'month' or 'day' filter
      day: filterType === "day" ? parseInt(day) || currentDay : 0, // Use current day for 'day' filter
    };

    console.log("Filters:", filters);

    // Execute stored procedure
    const transactions = await GetTransactionsPro(filters);
    console.log("Raw SQL transactions:", transactions);

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubcriptionDetails = async (req, res) => {
    try {
      const { filterType, year, month, day } = req.query;
  
      // Get the current date
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed
      const currentDay = currentDate.getDate();
  
      // Set default values based on filterType
      const filters = {
        filterType: filterType || "alltime",
        year:
          filterType === "alltime"
            ? 0
            : parseInt(year) || currentYear, // Use current year if not provided
        month:
          ["month", "day"].includes(filterType)
            ? parseInt(month) || currentMonth
            : 0, // Use current month for 'month' or 'day' filter
        day: filterType === "day" ? parseInt(day) || currentDay : 0, // Use current day for 'day' filter
      };
  
      console.log("Filters:", filters);
  
      // Execute stored procedure
      const subscriptionDetails = await GetSubscriptionDetails(filters);
      console.log("Raw SQL subscription details:", subscriptionDetails);
  
      res.json({ success: true, data: subscriptionDetails });
    } catch (error) {
      console.error("Error fetching subscription details:", error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };

exports.getcommissions = async (req, res) => {
    try {
        const { filterType, year, month, day } = req.query;
    
        // Get the current date
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed
        const currentDay = currentDate.getDate();
    
        // Set default values based on filterType
        const filters = {
          filterType: filterType || "alltime",
          year:
            filterType === "alltime"
              ? 0
              : parseInt(year) || currentYear, // Use current year if not provided
          month:
            ["month", "day"].includes(filterType)
              ? parseInt(month) || currentMonth
              : 0, // Use current month for 'month' or 'day' filter
          day: filterType === "day" ? parseInt(day) || currentDay : 0, // Use current day for 'day' filter
        };
    
        console.log("Filters:", filters);
    
        // Execute stored procedure
        const subscriptionDetails = await GetCommissions(filters);
        console.log("Raw SQL subscription details:", subscriptionDetails);
    
        res.json({ success: true, data: subscriptionDetails });
      } catch (error) {
        console.error("Error fetching subscription details:", error.message);
        res.status(500).json({ success: false, message: error.message });
      }
};

exports.getWithdrawals = async (req, res) => {
  const { status } = req.params;
  if (!status) {
    return {
      status: 400,
      data: {
        message: "status is required",
      },
    };
  }
  try {
    console.log("this is status", `'${status}'`);
    const users = await GetWithdrawals(`'${status}'`);
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log("this is total sub and revenue state error", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch total sub and revenue stat.",
    });
  }
};
