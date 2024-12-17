const adminUserTransactionService = require("../../services/adminServices/transaction");

exports.getWithdrawalHistory = async (req, res) => {
  try {
    const response = await adminUserTransactionService.getWithdrawalDetails(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
