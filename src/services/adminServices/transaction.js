const {
  getAllEcosystemTransactions,
} = require("../../controllers/AdminController/procedure");
const WithdrawalRequest = require("../../models/withdrawalRequest");
const Account = require("../../models/Account");

exports.ecosystemTransactions = async (req, res) => {
  try {
    const transactions = await getAllEcosystemTransactions();
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error in /api/ecosystem-transactions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions.",
    });
  }
};

exports.getWithdrawalDetails = async () => {
  const accountDetails = await Account.findAll({
    include: [
      {
        model: WithdrawalRequest,
        attributes: ["amount", "status"], // Include only necessary fields
        required: false, // Ensures accounts are returned even if there are no associated withdrawals
      },
    ],
  });

  return {
    status: 200,
    data: {
      message: accountDetails,
    },
  };
};
