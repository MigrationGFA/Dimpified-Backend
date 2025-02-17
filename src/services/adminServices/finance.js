const {
  GetGMV,
  GetNMV,
  GetAmountPaid,
  GetUnpaidAmount,
  GetTransactionIncome,
  GetTotalWithdrawals,
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
    console.log("results2:",result)

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
