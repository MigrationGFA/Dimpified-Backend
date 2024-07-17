const Ecosystem = require("../../models/Ecosystem");
const EcosystemUser = require("../../models/EcosystemUser");
const ServiceRequest = require("../../models/ServiceRequest");

const createServiceRequest = async (req, res) => {
  await ServiceRequest.sync();
  const {
    ecosystemDomain,
    ecosystemUserId,
    fromDate,
    toDate,
    proposedTime,
    notes,
    numberOfRequests,
    address,
    contact,
    paymentStatus,
    status,
  } = req.body;

  try {
    const ecosystemUser = await EcosystemUser.findByPk(ecosystemUserId);
    if (!ecosystemUser) {
      return res.status(404).json({ error: "EcosystemUser not found" });
    }

    const ecosystem = await Ecosystem.findOne({
      ecosystemDomain,
    });

    if (!ecosystem) {
      return res.status(404).json({ error: "Ecosystem not found" });
    }

    const serviceRequest = await ServiceRequest.create({
      ecosystemDomain: ecosystem.ecosystemDomain,
      ecosystemUserId,
      fromDate,
      toDate,
      proposedTime,
      notes,
      numberOfRequests,
      address,
      contact,
      paymentStatus: paymentStatus || "unpaid", // Default to 'unpaid' if not provided
      status,
    });

    return res.status(201).json(serviceRequest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create service request" });
  }
};

const getEcosystemServiceRequest = async (req, res) => {
  const { ecosystemDomain } = req.params;

  try {
    const serviceRequests = await ServiceRequest.findAll({
      where: { ecosystemDomain },
      include: [
        {
          model: EcosystemUser,
          attributes: ["username", "imageURL"],
        },
      ],
    });

    const ongoingRequests = serviceRequests.filter(
      (req) => req.status === "ongoing"
    );
    const completedRequests = serviceRequests.filter(
      (req) => req.status === "completed"
    );

    return res.json({
      all: serviceRequests,
      ongoingRequests,
      completedRequests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch service requests" });
  }
};

const getEcosystemUserServiceRequets = async (req, res) => {
  const { ecosystemUserId } = req.params;

  try {
    const serviceRequests = await ServiceRequest.findAll({
      where: { ecosystemUserId },
    });

    const ongoingRequests = serviceRequests.filter(
      (req) => req.status === "ongoing"
    );
    const completedRequests = serviceRequests.filter(
      (req) => req.status === "completed"
    );

    return res.json({
      all: serviceRequests,
      ongoingRequests,
      completedRequests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch service requests" });
  }
};

module.exports = {
  createServiceRequest,
  getEcosystemServiceRequest,
  getEcosystemUserServiceRequets,
};
