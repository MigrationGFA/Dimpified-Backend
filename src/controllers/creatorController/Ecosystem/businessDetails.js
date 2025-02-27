const ecosystemDetails = require("../../../services/ecosytem");

exports.createBusinessDetails = async (req, res) => {
  try {
    const response = await ecosystemDetails.createBusinessDetails(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAboutEcosystem = async (req, res) => {
  try {
    const response = await ecosystemDetails.getAboutEcosystem(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.checkDomainAvailability = async (req, res) => {
  try {
    const response = await ecosystemDetails.checkDomainAvailability(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.makeWithdrawalRequest = async (req, res) => {
  try {
    const response = await ecosystemDetails.makeWithdrawalRequest(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error making a withdrawal request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getWithdrawalRequests = async (req, res) => {
  try {
    const response = await ecosystemDetails.getWithdrawalRequests(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.totalWithdrawalStats = async (req, res) => {
  try {
    const response = await ecosystemDetails.totalWithdrawalStats(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.websiteDetails = async (req, res) => {
  try {
    const response = await ecosystemDetails.websiteDetails(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getNotification = async (req, res) => {
  try {
    const response = await ecosystemDetails.getNotification(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.markNotificationAsViewed = async (req, res) => {
  try {
    const response = await ecosystemDetails.markNotificationAsViewed(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getEcosystemNearMe = async (req, res) => {
  try {
    const response = await ecosystemDetails.getEcosystemNearMe(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting business near me:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getMerchantCustomers = async (req, res) => {
  try {
    const response = await ecosystemDetails.getMerchantCustomers(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting business near me:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.addCustomer = async (req, res) => {
  try {
    const response = await ecosystemDetails.addCustomer(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting business near me:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const response = await ecosystemDetails.deleteCustomer(req.query);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting business near me:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.editCustomerDetails = async (req, res) => {
  try {
    const response = await ecosystemDetails.editCustomerDetails(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting business near me:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getCustomerDetails = async (req, res) => {
  try {
    const response = await ecosystemDetails.getCustomerDetails(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting business near me:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
