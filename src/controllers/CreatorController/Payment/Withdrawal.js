const paymentServices = require("../../../services/paymentServices");

exports.withdrawalRequest = async (req, res) => {
  try {
    const response = await paymentServices.withdrawalRequest(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting withdrawals:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
