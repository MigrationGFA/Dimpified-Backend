const affiliateEarning = require("../../../services/affiliateServices/paymentServices");

exports.affiliateWithdrawalRequest = async (req, res) => {
  try {
    const response = await affiliateEarning.affiliateWithdrawalRequest(
      req.body
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAffiliateWithdrawalRequest = async (req, res) => {
  try {
    const response = await affiliateEarning.getAffiliateWithdrawRequest(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting affiliate withdrawal request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAffiliateEarning = async (req, res) => {
  try {
    const response = await affiliateEarning.getAffiliateEarning(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting affiliate earning:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.affiliateEarningHistory = async (req, res) => {
  try {
    const response = await affiliateEarning.affiliateEarningHistory(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting affiliate earning history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.affiliateTotalWithdrawalStats = async (req, res) => {
  try {
    const response = await affiliateEarning.affiliateTotalWithdrawalStats(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting total affiliate withdrawal stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
