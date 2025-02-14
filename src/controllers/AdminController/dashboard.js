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

exports.getAUserInformation = async (req, res) => {
  try {
    const response = await adminDashboardServices.getAuserInformations(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAdminDashboardSubcategory = async (req, res) => {
  try {
    const response = await adminDashboardServices.getSubCategory(req.query);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAdminDashboardSubcategoryInformation = async (req, res) => {
  try {
    const response = await adminDashboardServices.subCategoryInformation(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const response = await adminDashboardServices.getAllCategory();
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all category", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllStores = async (req, res) => {
  try {
    const response = await adminDashboardServices.getAllStores();
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all store", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTopStores = async (req, res) => {
  try {
    const response = await adminDashboardServices.getTopStores();
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all store", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
