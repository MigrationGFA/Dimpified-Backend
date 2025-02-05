const subscriptionService = require("../../services/adminServices/subscription");

exports.getAllSubscriptions = async (req, res) => {
  try {
    const response = await subscriptionService.allSubscription(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTotalSubscriptions = async (req, res) => {
  try {
    const response = await subscriptionService.totalSubscription(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCalculatedTotalSubscriptions = async (req, res) => {
  try {
    const response = await subscriptionService.calculateTotalSubscription(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
