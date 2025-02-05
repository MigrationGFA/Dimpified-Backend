const profileServices = require("../../services/profileServices");

exports.getProfileDetails = async (req, res) => {
  try {
    console.log("params:", req.params);
    const response = await profileServices.getProfileDetails(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.editProfileDetails = async (req, res) => {
  try {
    const response = await profileServices.editProfileDetails(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
