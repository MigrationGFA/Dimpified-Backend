const adminDashboardServices = require("../../services/adminServices/dashboard");

exports.getAdminDashboardUsers = async (req, res) => {
  try {
    const response = await adminDashboardServices.DashboardAllUsers(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAdminDashboardSubscribers = async (req, res) => {
  try {
    const response = await adminDashboardServices.AdminSubscriptionCounts(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAdminDashboardUsersInformations = async (req, res) => {
  try {
    const response = await adminDashboardServices.dashboardUsersInformation(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
