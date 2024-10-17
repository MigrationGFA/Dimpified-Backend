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

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(400).json({ message: "Invalid ecosystem domain name" });
    }

    // let backgroundCover = [];

    // if (req.files && req.files.length > 0) {
    //   backgroundCover = req.files.map((file) => {
    //     return `${process.env.IMAGE_URL}/${file.filename}`;
    //   });
    // }

    // Ensure services are parsed correctly
    //let parsedServices = JSON.parse(services);

    const service = new Service({
      category,
      subCategory,
      header,
      description,
      creatorId,
      ecosystemDomain,
      format,
      currency,
      services,
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

    const services = await Service.find({ ecosystemDomain }).sort({
      createdAt: -1,
    });
    console.log("tick");
    if (services.length === 0) {
      return res
        .status(200)
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
    const serviceId = req.params.serviceId;

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

const editServiceDetailsAndAddService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const {
      category,
      subCategory,
      header,
      description,
      format,
      currency,
      newService,
    } = req.body;

    // Check if the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Update the main service fields
    service.category = category !== undefined ? category : service.category;
    service.subCategory =
      subCategory !== undefined ? subCategory : service.subCategory;
    service.header = header !== undefined ? header : service.header;
    service.description =
      description !== undefined ? description : service.description;
    service.format = format !== undefined ? format : service.format;
    service.currency = currency !== undefined ? currency : service.currency;

    // Add new sub-service if provided
    if (newService) {
      service.services.push(newService);
    }

    // Save the updated service
    await service.save();

    res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const editSubService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const {
      subServiceId,
      name,
      shortDescription,
      price,
      deliveryTime,
      priceFormat,
      serviceImage,
    } = req.body;

    // Find the main service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Find the specific sub-service
    const subService = service.services.find(
      (s) => s._id.toString() === subServiceId.toString()
    );
    if (!subService) {
      return res.status(404).json({ message: "Sub-service not found" });
    }

    // Update the sub-service fields
    subService.name = name !== undefined ? name : subService.name;
    subService.shortDescription =
      shortDescription !== undefined
        ? shortDescription
        : subService.shortDescription;
    subService.price = price !== undefined ? price : subService.price;
    subService.deliveryTime =
      deliveryTime !== undefined ? deliveryTime : subService.deliveryTime;
    subService.priceFormat =
      priceFormat !== undefined ? priceFormat : subService.priceFormat;
    subService.serviceImage =
      serviceImage !== undefined ? serviceImage : subService.serviceImage;

    // Save the updated service
    await service.save();

    res
      .status(200)
      .json({ message: "Sub-service updated successfully", service });
  } catch (error) {
    console.error("Error updating sub-service:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
  createService,
  getAllServices,
  getAService,
  editServiceDetailsAndAddService,
  editSubService,
};
