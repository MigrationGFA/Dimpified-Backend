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
    const { ecosystemDomain } = req.params;

    if (!ecosystemDomain) {
      return res.status(400).json({ message: "EcosystemDomain is required" });
    }

    // Fetch all tickets for the given ecosystemDomain
    const tickets = await HelpCenter.findAll({
      where: { ecosystemDomain },
      include: [
        {
          model: EndUser,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    // Separate tickets into read and unread
    const readTickets = tickets.filter((ticket) => ticket.view === true);
    const unreadTickets = tickets.filter((ticket) => ticket.view === false);

    return res.status(200).json({ read: readTickets, unread: unreadTickets });
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

    const ticket = await HelpCenter.findByPk(id, {
      include: [
        {
          model: EndUser,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }
    if (ticket.view == false) {
      ticket.view = true;
    }

    await ticket.save();
    return res.status(200).json(ticket);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getSupportBoxStats = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;

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
