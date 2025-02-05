const affiliateDashboard = require("../../../services/affiliateServices/dashboardServices");

exports.getAffiliateDashboardstat = async (req, res) => {
  try {
    const response = await affiliateDashboard.getAffiliateDashboardstat(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getLastFourOnboardedUsers = async (req, res) => {
  try {
    const response = await affiliateDashboard.getLastFourOnboardedUsers(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.allAffiliateOnboardUsers = async (req, res) => {
  try {
    const response = await affiliateDashboard.allAffiliateOnboardUsers(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.affiliateUserBlocks = async (req, res) => {
  try {
    const response = await affiliateDashboard.affiliateUserBlocks(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getLastFourSubscribeUsers = async (req, res) => {
  try {
    const response = await affiliateDashboard.getLastFourSubscribeUsers(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
