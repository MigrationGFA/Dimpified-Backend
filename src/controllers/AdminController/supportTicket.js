const supportService = require("../../services/adminServices/supportTicket");

exports.getSupportsInformation = async (req, res) => {
  try {
    const response = await supportService.supportTicketInformation(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getASupportsInformation = async (req, res) => {
  try {
    const response = await supportService.getASupportInformations(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all users", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
