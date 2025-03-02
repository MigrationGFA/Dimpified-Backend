const HelpCenter = require("../../models/EcosystemHelpCenter");
const EndUser = require("../../models/EcosystemUser");
const Creator = require("../../models/Creator");

exports.createSupportTicket = async (req, res) => {
  try {
    const { userId, reason, message, creatorId, ecosystemDomain } = req.body;

    if (!reason || !message || !ecosystemDomain) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    await HelpCenter.create({
      userId,
      reason,
      message,
      creatorId,
      ecosystemDomain,
      status: "pending",
    });

    return res.status(201).json({ message: "Support ticket created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.getMerchantSupportTickets = async (req, res) => {
  try {
    const { ecosystemDomain, status } = req.query;

    if (!ecosystemDomain || !status) {
      return res.status(400).json({ message: "EcosystemDomain and status are required" });
    }

    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const tickets = await HelpCenter.findAll({ where: { ecosystemDomain, status } });

    return res.status(200).json({ tickets });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.getSupportTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Ticket ID is required" });
    }

    const ticket = await HelpCenter.findByPk(id);
    // const ticket = await HelpCenter.findByPk(id, {
    //   include: [{ model: EndUser }, { model: Creator }],
    // });

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.getSupportBoxStats = async (req, res) => {
  try {
    const { ecosystemDomain } = req.query;

    if (!ecosystemDomain) {
      return res.status(400).json({ message: "Ecosystem domain is required" });
    }

    // Fetch total, completed, and pending requests
    const totalRequests = await HelpCenter.count({ where: { ecosystemDomain } });
    const attendedRequests = await HelpCenter.count({ where: { ecosystemDomain, status: "completed" } });
    const unattendedRequests = await HelpCenter.count({ where: { ecosystemDomain, status: "pending" } });

    return res.status(200).json({
      totalRequests,
      attendedRequests,
      unattendedRequests,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
