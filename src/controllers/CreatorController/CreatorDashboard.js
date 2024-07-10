const Ecosystem = require("../../models/Ecosystem");
const EcosystemUser = require("../../models/EcosystemUser");
const Template = require("../../models/Templates");
const { Op } = require("sequelize");

const popularEcosystems = async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const topEcosystems = await Ecosystem.find({ creatorId })
      .sort({ users: -1 })
      .limit(4);

    if (topEcosystems.length === 0) {
      return res
        .status(404)
        .json({ message: "User has no created ecosystems" });
    }

    const ecosystemsWithLogos = await Promise.all(
      topEcosystems.map(async (ecosystem) => {
        const template = await Template.findOne({ ecosystemId: ecosystem._id });
        return {
          ...ecosystem.toObject(),
          logo: template ? template.navbar.logo : null,
        };
      })
    );

    res.status(200).json({ ecosystemsWithLogos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

const allEcosystemUsers = async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const ecosystems = await Ecosystem.find({ creatorId });
    if (!ecosystems) {
      return res
        .status(404)
        .json({ message: "User has no created Ecosystems" });
    }

    const ecosystemDomains = ecosystems.map(
      (ecosystem) => ecosystem.ecosystemDomain
    );

    if (ecosystemDomains.length === 0) {
      return res.status(404).json({ message: "No ecosystem domains found" });
    }

    const ecosystemUsers = await EcosystemUser.findAll({
      where: {
        ecosystemDomain: {
          [Op.in]: ecosystemDomains,
        },
      },
    });

    if (ecosystemUsers.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for the given ecosystems" });
    }

    res.status(200).json({ ecosystemUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

const usersPerEcosystem = async (req, res) => {
  try {
    const { creatorId, ecosystemId } = req.body;

    const ecosystems = await Ecosystem.find({ creatorId });
    if (!ecosystems) {
      return res
        .status(404)
        .json({ message: "User has no created Ecosystems" });
    }

    const isEcosystemCreator = ecosystems.find(
      (ecosystem) => ecosystem._id.toString() === ecosystemId.toString()
    );
 
    if (!isEcosystemCreator) {
      return res
        .status(400)
        .json({ message: "You are not permitted to access this Ecosystem!!" });
    }

    const domain = isEcosystemCreator.ecosystemDomain;

    const users = await EcosystemUser.findAll({
      where: {
        ecosystemDomain: domain,
      },
    });

    if (!users.length === 0) {
      return res
        .status(404)
        .json({ message: "There are no users in this ecosystem" });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = { popularEcosystems, allEcosystemUsers, usersPerEcosystem };
