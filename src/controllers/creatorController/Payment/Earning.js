const paymentServices = require("../../../services/paymentServices");

exports.ecosystemEarning = async (req, res) => {
  try {
    const response = await paymentServices.ecosystemEarning(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting earnings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.incomeStats = async (req, res) => {
  try {
    const response = await paymentServices.incomeStats(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting income statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.dailySuccessful = async (req, res) => {
  try {
    const response = await paymentServices.dailySuccessful(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting daily successful Transaction:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.totalMonthlySales = async (req, res) => {
  try {
    const response = await paymentServices.totalMonthlySales(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting total Monthly sales:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.transactionHistory = async (req, res) => {
  try {
    const response = await paymentServices.transactionHistory(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error fetching ecosystem transaction history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};