const teamServices = require("../../services/teamMember");

exports.addTeamMember = async (req, res) => {
  try {
    console.log("body:", req.body);
    const response = await teamServices.addTeamMember(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.onboardTeamMember = async (req, res) => {
  try {
    console.log("body:", req.body);
    const response = await teamServices.onboardTeamMember(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getTeamMembers = async (req, res) => {
  try {
    console.log("body:", req.params);
    const response = await teamServices.getTeamMembers(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.deleteTeamMember = async (req, res) => {
  try {
    console.log("params:", req.query);
    const response = await teamServices.deleteTeamMember(req.query);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
