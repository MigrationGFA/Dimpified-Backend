const { sequelize } = require("../../config/dbConnect");
const getAllUsers = async () => {
  try {
    const [results] = await sequelize.query("CALL getusersstats()");
    return results; // Return the result of the procedure
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw error;
  }
};

const getMonthlyRegistration = async () => {
  try {
    const results = await sequelize.query("CALL GetRegistrationsByMonth()");

    return results;
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw error;
  }
};

const GetPlanTypeAndTotalSubscription = async () => {
  try {
    const [results] = await sequelize.query(
      "CALL GetPlanTypeAndTotalSubscription()"
    );
    return results; // Return the result of the procedure
  } catch (error) {
    console.error("Error fetching supports:", error.message);
    throw error;
  }
};

const GetMonthlySubscriptions = async () => {
  try {
    const results = await sequelize.query(
      "CALL GetMonthlySubscriptionSummary()"
    );
    return results; // Return the result of the procedure
  } catch (error) {
    console.error("Error fetching supports:", error.message);
    throw error;
  }
};

const GetSupportTicketStatusCount = async () => {
  try {
    const [results] = await sequelize.query(
      "CALL GetSupportTicketStatusCount()"
    );
    return results; // Return the result of the procedure
  } catch (error) {
    console.error("Error fetching supports:", error.message);
    throw error;
  }
};

const getAllEcosystemTransactions = async () => {
  try {
    const [results] = await sequelize.query("CALL GetAllTransactions()");
    return results; // Return the result of the procedure
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    throw error;
  }
};

const getTotalSubscription = async () => {
  try {
    const results = await sequelize.query("CALL GetTotalSubscription()");
    return results; // Return the result of the procedure
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    throw error;
  }
};

const getRevAndSubStat = async (date) => {
  try {
    console.log("this is date", date);
    const results = await sequelize.query(`CALL GetRevAndSubStat(${date})`);
    return results; // Return the result of the procedure
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    throw error;
  }
};

const getUsersByPlan = async (plan) => {
  try {
    console.log("this is date", plan);
    const results = await sequelize.query(`CALL GetUsersByPlan(${plan})`);
    return results; // Return the result of the procedure
  } catch (error) {
    console.error("Error fetching user plan:", error.message);
    throw error;
  }
};

const getPlanTypeCount = async () => {
  try {
    const results = await sequelize.query("CALL GetPlanTypeCount()");
    return results; // Return the result of the procedure
  } catch (error) {
    console.error("Error fetching plan type:", error.message);
    throw error;
  }
};

const getTotalSales = async (date) => {
  try {
    console.log("this is date", date);
    const results = await sequelize.query(`CALL GetTotalSales(${date})`);
    return results;
  } catch (error) {
    console.error("Error fetching total sales:", error.message);
    throw error;
  }
};

const GetGMV = async () => {
  try {
    const [results] = await sequelize.query("CALL GetGMV()");
    return results;
  } catch (error) {
    console.error("Error fetching GMV:", error.message);
    throw error;
  }
};

const GetNMV = async () => {
  try {
    const [results] = await sequelize.query("CALL GetNMV()");
    return results;
  } catch (error) {
    console.error("Error fetching NMV:", error.message);
    throw error;
  }
};

const GetAmountPaid = async () => {
  try {
    const [results] = await sequelize.query("CALL GetAmountPaid()");
    return results;
  } catch (error) {
    console.error("Error fetching amount paid:", error.message);
    throw error;
  }
};

const GetUnpaidAmount = async () => {
  try {
    const [results] = await sequelize.query("CALL GetUnpaidAmount()");
    return results;
  } catch (error) {
    console.error("Error fetching unpaid amount:", error.message);
    throw error;
  }
};

const GetTransactionIncome = async () => {
  try {
    const [results] = await sequelize.query("CALL GetTransactionIncome()");
    return results;
  } catch (error) {
    console.error("Error fetching transaction income:", error.message);
    throw error;
  }
};

const GetTotalWithdrawals = async () => {
  try {
    const [results] = await sequelize.query("CALL GetTotalWithdrawals()");
    console.log("results:", results);

    return results;
  } catch (error) {
    console.error("Error fetching total withdrawals:", error.message);
    throw error;
  }
};

const GetTransactionsPro = async ({ filterType, year, month, day }) => {
  try {
    const results = await sequelize.query(
      "CALL GetTransactionsPro(:filterType, :year, :month, :day)",
      {
        replacements: { filterType, year, month, day },
        raw: true,
      }
    );

    console.log("Raw SQL Results:", results);

    // If results is an array, return everything
    return results|| []; // Ensure it's returning an array
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    throw error;
  }
};

const GetSubscriptionDetails = async ({ filterType, year, month, day }) => {
  try {
    // Call the stored procedure with properly structured data
    const results = await sequelize.query(
      "CALL GetSubscriptionDetails(:filterType, :year, :month, :day)",
      {
        replacements: { filterType, year, month, day },
        raw: true,
      }
    );

    console.log("Raw SQL Results:", results); // Log full SQL response
    return results || []; // Return full results array
  } catch (error) {
    console.error("Error fetching subscription details:", error.message);
    throw error;
  }
};

const GetCommissions = async ({ filterType, year, month, day }) => {
  try {
    

    // Call the stored procedure with properly structured data
    const results= await sequelize.query(
      "CALL GetCommissions(:filterType, :year, :month, :day)",
      {
        replacements: { filterType, year, month, day },
        raw: true,
      }
    );

    return results || [];
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    throw error;
  }
};

const GetWithdrawals = async (status) => {
  try {
    console.log("this is status", status);
    const results = await sequelize.query(`CALL GetWithdrawalTable(${status})`);
    return results;
  } catch (error) {
    console.error("Error fetching total sales:", error.message);
    throw error;
  }
};

const GetSubscriptionIncome = async () => {
  try {
    const results = await sequelize.query(`CALL GetSubscriptionIncome`);
    return results;
  } catch (error) {
    console.error("Error fetching total sub income:", error.message);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getMonthlyRegistration,
  GetPlanTypeAndTotalSubscription,
  GetMonthlySubscriptions,
  GetSupportTicketStatusCount,
  getAllEcosystemTransactions,
  getTotalSubscription,
  getRevAndSubStat,
  getUsersByPlan,
  getPlanTypeCount,
  getTotalSales,
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
  GetSubscriptionIncome,
};
