const AffiliateAccount = require("../../../services/affiliateServices/accountServices");

exports.getAffiliateBankDetails = async (req, res) => {
  try {
    const response = await AffiliateAccount.getAffiliateBankDetails(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.affiliateEarningAccount = async (req, res) => {
  try {
    const response = await AffiliateAccount.affiliateEarningAccount(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.affiliateEarningHistory = async (req, res) => {
  try {
    const response = await AffiliateAccount.affiliateEarningHistory(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.editAffiliateBankDetails = async (req, res) => {
  try {
    const response = await AffiliateAccount.editAffiliateBankDetails(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.saveAffiliateBankDetails = async (req, res) => {
  try {
    const response = await AffiliateAccount.saveAffiliateAccount(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
