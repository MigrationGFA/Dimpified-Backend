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
      ecosystemId,
      format,
      currency,
      services,
    } = req.body;

    const details = [
      "header",
      "category",
      "subCategory",
      "creatorId",
      "ecosystemId",
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

    const ecosystem = await Ecosystem.findById(ecosystemId);
    if (!ecosystem) {
      return res.status(400).json({ message: "Invalid ecosystem Id" });
    }

    let backgroundCover = [];
    console.log("req.files:", req.files);

    if (req.files && req.files.length > 0) {
      backgroundCover = req.files.map((file) => {
         return `https://dimpified-backend-development.azurewebsites.net/uploads/background-cover/${file.filename}`;
      });
    }

    // Ensure services are parsed correctly
    let parsedServices=JSON.parse(services);
 
    const service = new Service({
      category,
      subCategory,
      header,
      description,
      creatorId,
      ecosystemId,
      format,
      currency,
      services:parsedServices,
      backgroundCover,
    });

    await service.save();
    res.status(200).json({ message: "Service created succesfully", service });
  } catch (error) {
    console.log("error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createService };
