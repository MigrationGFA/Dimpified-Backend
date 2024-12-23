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

module.exports = {
  getAllUsers,
  getMonthlyRegistration,
  GetPlanTypeAndTotalSubscription,
  GetMonthlySubscriptions,
  GetSupportTicketStatusCount,
  getAllEcosystemTransactions,
};
