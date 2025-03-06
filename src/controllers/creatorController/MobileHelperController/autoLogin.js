const mobileHelper = require("../../../services/creatorAuthServices");

exports.autoCreatorLogin = async (req, res) => {
  try {
    const response = await mobileHelper.autoCreatorLogin(req);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};