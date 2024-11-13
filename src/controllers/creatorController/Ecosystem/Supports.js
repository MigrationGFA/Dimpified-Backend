const ecosystemSupports = require("../../../services/supports");

exports.creatorSupports = async (req, res) => {
  try {
    const response = await ecosystemSupports.creatorSupportRequest(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating Support request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllCreatorSupportsRequest = async (req, res) => {
  try {
    const response = await ecosystemSupports.allCreatorSupportRequest(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating Support request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getSupportRequestByDomain = async (req, res) => {
  try {
    const response = await ecosystemSupports.getSupportSummaryByDomain(
      req.params
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating Support request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
