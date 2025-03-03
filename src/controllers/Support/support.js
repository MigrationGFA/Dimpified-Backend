const HelpCenter = require("../../models/EcosystemHelpCenter");
const EndUser = require("../../models/EcosystemUser");
const Ecosystem = require("../../models/Ecosystem");
const Creator = require("../../models/Creator");
const bcrypt = require("bcryptjs");

exports.createSupportTicket = async (req, res) => {
  try {
    const { email, reason, message, phoneNumber, ecosystemDomain, name } =
      req.body;

    if (!reason || !message || !ecosystemDomain) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(404).json({ message: "ecosystem not found" });
    }

    let user = await EndUser.findOne({ where: { email, ecosystemDomain } });

    if (!user) {
      const hashedPassword = await bcrypt.hash(email, 10);
      user = await EndUser.create({
        ecosystemDomain,
        username: name,
        phoneNumber,
        email,
        password: hashedPassword,
        address: "not available",
      });
      console.log("customers:", user);
    }

    await HelpCenter.create({
      userId: user.id,
      reason,
      message,
      creatorId: ecosystem.creatorId,
      ecosystemDomain,
      status: "pending",
    });

    return res
      .status(201)
      .json({ message: "Support ticket created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getMerchantSupportTickets = async (req, res) => {
  try {
    const { ecosystemDomain, status } = req.query;

    if (!ecosystemDomain || !status) {
      return res
        .status(400)
        .json({ message: "EcosystemDomain and status are required" });
    }

    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const tickets = await HelpCenter.findAll({
      where: { ecosystemDomain, status },
    });

    return res.status(200).json({ tickets });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getSupportTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Ticket ID is required" });
    }

    const ticket = await HelpCenter.findByPk(id);
    console.log("ticket:",ticket)
    // const ticket = await HelpCenter.findByPk(id, {
    //   include: [{ model: EndUser }, { model: Creator }],
    // });

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }
    if (ticket.view == false) {
      ticket.view = true;
    }
    console.log("ticket:",ticket)

    return res.status(200).json(ticket);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getSupportBoxStats = async (req, res) => {
  try {
    const { ecosystemDomain } = req.query;

    if (!ecosystemDomain) {
      return res.status(400).json({ message: "Ecosystem domain is required" });
    }

    // Fetch total, completed, and pending requests
    const totalRequests = await HelpCenter.count({
      where: { ecosystemDomain },
    });
    const attendedRequests = await HelpCenter.count({
      where: { ecosystemDomain, status: "completed" },
    });
    const unattendedRequests = await HelpCenter.count({
      where: { ecosystemDomain, status: "pending" },
    });

    return res.status(200).json({
      totalRequests,
      attendedRequests,
      unattendedRequests,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
