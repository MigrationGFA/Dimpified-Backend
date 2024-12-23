const adminNotificationService = require("../../services/adminServices/adminNotifications");

exports.getAdminNotifications = async (req, res) => {
  try {
    const response = await adminNotificationService.getAdminNotification(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
