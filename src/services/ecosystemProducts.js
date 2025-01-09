const Ecosystem = require("../models/Ecosystem");
const Creator = require("../models/Creator");
const Service = require("../models/Service");

// service endpoint
exports.createService = async (body) => {
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
  } = body;

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
    if (!body[detail]) {
      return { status: 400, data: { message: `${detail} is required` } };
    }
  }

  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    return { status: 404, data: { message: "Please onboard as a creator" } };
  }

  const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
  if (!ecosystem) {
    return { status: 404, data: { message: "Invalid ecosystem domain name" } };
  }

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
  return {
    status: 200,
    data: { message: "Service created succesfully", service },
  };
};

exports.getAllServices = async (params) => {
  const ecosystemDomain = params.ecosystemDomain;

  const services = await Service.find({ ecosystemDomain }).sort({
    createdAt: -1,
  });
  console.log("tick");
  if (services.length === 0) {
    return {
      status: 404,
      data: { message: "No services found under this ecosystem" },
    };
  }

  return { status: 200, data: services };
};

exports.editServiceDetailsAndAddService = async (body) => {
  const {
    category,
    subCategory,
    header,
    description,
    format,
    currency,
    newService,
    serviceId,
  } = body;

  // Check if the service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return { status: 404, data: { message: "Service not found" } };
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

  return {
    status: 200,
    data: { message: "Service updated succesfully", service },
  };
};

exports.editSubService = async (body) => {
  const {
    subServiceId,
    name,
    shortDescription,
    price,
    deliveryTime,
    priceFormat,
    serviceImage,
    serviceId,
  } = body;

  // Find the main service
  const service = await Service.findById(serviceId);
  if (!service) {
    return { status: 404, data: { message: "Service not found" } };
  }

  // Find the specific sub-service
  const subService = service.services.find(
    (s) => s._id.toString() === subServiceId.toString()
  );
  if (!subService) {
    return { status: 404, data: { message: "Sub-service not found" } };
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

  return {
    status: 200,
    data: { message: "Sub-service updated successfully", service },
  };
};

