const Creator = require("../../../models/Creator");
const Ecosystem = require("../../../models/Ecosystem");
const Service = require("../../../models/Service");

const createService = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      header,
      description,
      creatorId,
      ecosystemDomain,
      format,
      currency,
      services,
    } = req.body;

    const details = [
      "header",
      "category",
      "subCategory",
      "creatorId",
      "ecosystemDomain",
      "description",
      "format",
      "services",
      "currency",
    ];
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }

    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(400).json({ message: "Please onboard as a creator" });
    }

    const ecosystem = await Ecosystem.findOne({ecosystemDomain});
    if (!ecosystem) {
      return res.status(400).json({ message: "Invalid ecosystem Id" });
    }

    let backgroundCover = [];

    if (req.files && req.files.length > 0) {
      backgroundCover = req.files.map((file) => {
         return `https://dimpified-backend-development.azurewebsites.net/uploads/background-cover/${file.filename}`;
      });
    }

    // Ensure services are parsed correctly
    let parsedServices = JSON.parse(services);

    const service = new Service({
      category,
      subCategory,
      header,
      description,
      creatorId,
      ecosystemDomain,
      format,
      currency,
      services: parsedServices,
      backgroundCover,
    });

    await service.save();
    res.status(200).json({ message: "Service created succesfully", service });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllServices = async (req, res) => {
  try {
     const ecosystemDomain = req.params.ecosystemDomain;

    const services = await Service.find({ ecosystemDomain }).sort(
      { createdAt: -1 });

    if (services.length === 0) {
      return res
        .status(404)
        .json({ message: "No services found under this ecosystem" });
    }

    res.status(200).json({ services });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAService = async (req, res) => {
  try {
    const serviceId  = req.params.serviceId;

    const service = await Service.findOne({ _id: serviceId });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ service });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createService, getAllServices,getAService };
