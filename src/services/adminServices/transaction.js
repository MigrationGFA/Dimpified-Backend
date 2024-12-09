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
  const withdrawalRequests = await WithdrawalRequest.findAll({
    attributes: ["id", "amount", "status", "requestedAt"],
    include: [
      {
        model: Account,
        attributes: ["accountName", "accountNumber", "bankName"],
      },
    ],
    order: [["requestedAt", "DESC"]],
  });
  console.log("withdrawals", withdrawalRequests);
  if (!withdrawalRequests.length) {
    return {
      status: 200,
      data: {
        message: " No withdrawal History found",
      },
    };
  }

  // Format the data
  const formattedData = withdrawalRequests.map((request) => {
    const { id, amount, status, requestedAt } = request;
    const { accountName, accountNumber, bankName } = request.Account || {};
    const date = new Date(requestedAt).toLocaleDateString();
    const time = new Date(requestedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      id: id.toString().padStart(4, "0"), // Format ID as 4 digits
      accountName,
      accountNumber,
      bankName,
      date,
      time,
      amount: `₦${parseFloat(amount).toLocaleString()}`, // Format amount
      status,
    };
  });

  return {
    status: 200,
    data: {
      status: true,
      data: formattedData,
    },
  };
};
