const Ecosystem = require("../models/Ecosystem");
const Creator = require("../models/Creator");
const CreatorTemplate = require("../models/creatorTemplate");
const Service = require("../models/Service");
const ReservedTemplate = require("../models/ReservedTemplate");
const generateSimilarDomainNames = require("../utils/domainUtils");
const WithdrawalRequest = require("../models/withdrawalRequest");
const sendWithdrawalRequestEmail = require("../utils/creatorWithdrawalEmail");
const CreatorEarning = require("../models/CreatorEarning");
const { Op } = require("sequelize");
const Notification = require("../models/ecosystemNotification");
const AdminNotification = require("../models/AdminNotification");
const CreatorProfile = require("../models/CreatorProfile");

// creating ecosystem business details
exports.createBusinessDetails = async (body) => {
  const {
    creatorId,
    ecosystemName,
    ecosystemDomain,
    targetAudienceSector,
    mainObjective,
    contact,
    address,
    ecosystemDescription,
    country,
    state,
    localGovernment,
  } = body;

  const requiredFields = [
    "creatorId",
    "ecosystemName",
    "ecosystemDomain",
    "targetAudienceSector",
    "mainObjective",
    "contact",
    "address",
    "ecosystemDescription",
    "country",
    "state",
    "localGovernment",
  ];

  for (const detail of requiredFields) {
    if (!body[detail]) {
      return { status: 400, data: { message: `${detail} is required` } };
    }
  }

  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
  }
  
  creator.step = 3;
  creator.organizationName = ecosystemName;

  let ecosystem;
  ecosystem = new Ecosystem({
    creatorId,
    ecosystemName,
    ecosystemDomain,
    contact,
    mainObjective,
    steps: 1,
    targetAudienceSector,
    address,
    ecosystemDescription,
    country,
    state,
    localgovernment: localGovernment,
    status: "draft",
  });
  await creator.save();
  await ecosystem.save();
  return {
    status: 201,
    data: { message: "Ecosystem about information saved", ecosystem },
  };
};

exports.getAboutEcosystem = async ({ creatorId }) => {
  if (!creatorId) {
    return { status: 400, data: { message: "creatorId is required" } };
  }
  const getEcosystem = await Ecosystem.findOne({
    creatorId: creatorId,
  });
  if (!getEcosystem) {
    return {
      status: 404,
      data: {
        message: "business info not found",
      },
    };
  }
  return {
    status: 200,
    data: {
      getEcosystem,
    },
  };
};

// template section
exports.createNewTemplate = async (body) => {
  const { creatorId, ecosystemDomain, templateId } = body;

  const requiredFields = ["creatorId", "ecosystemDomain", "templateId"];

  for (const detail of requiredFields) {
    if (!body[detail]) {
      return { status: 400, data: { message: `${detail} is required` } };
    }
  }
  // Check if the creator exists
  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
  }

  const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
  if (!ecosystem) {
    return { status: 404, data: { message: "Ecosystem not found" } };
  }

  // Prepare the template data
  const templateData = {
    creatorId,
    ecosystemDomain,
    templateId,
    navbar: body.navbar,
    hero: body.hero,
    aboutUs: body.aboutUs,
    Vision: body.Vision,
    Statistics: body.Statistics,
    Patrners: body.Patrners,
    Events: body.Events,
    Gallery: body.Gallery,
    LargeCta: body.LargeCta,
    Team: body.Team,
    Blog: body.Blog,
    Reviews: body.Reviews,
    contactUs: body.contactUs,
    faq: body.faq,
    faqStyles: body.faqStyles,
    footer: body.footer,
  };

  // Create the template
  const template = await CreatorTemplate.create(templateData);

  // Update ecosystem with the new template
  ecosystem.steps = 2;
  ecosystem.templates = template._id;
  creator.step = 4;
  await creator.save();
  await ecosystem.save();
  return {
    status: 201,
    data: { message: "Template created successfully", template },
  };
};

exports.createReservedTemplate = async (body) => {
  const { templateId } = body;

  if (!templateId || templateId == "not available") {
    return { status: 400, data: { message: "Template id is required" } };
  }
  // Check if the creator exists
  const templateExists = await ReservedTemplate.findOne({ templateId });
  if (templateExists) {
    return { status: 400, data: { message: "templateId already in use" } };
  }

  const template = await ReservedTemplate.create(body);
  return {
    status: 201,
    data: { message: "Template created successfully", template },
  };
};

// get template
exports.getAnEcosystemTemplate = async (params) => {
  const { ecosystemDomain } = params;
  if (!ecosystemDomain) {
    return {
      status: 400,
      data: { message: "ecosystemDomain name  is required" },
    };
  }

  const ecosystem = await Ecosystem.findOne({
    ecosystemDomain: ecosystemDomain,
  });

  if (!ecosystem) {
    return { status: 404, data: { message: "Ecosystem not found" } };
  }

  const template = await CreatorTemplate.findOne({
    ecosystemDomain: ecosystemDomain,
  });

  if (!template) {
    return { status: 404, data: { message: "Template not found" } };
  }

  const creator = await Creator.findByPk(ecosystem.creatorId);
  const creatorProfile = await CreatorProfile.findOne({creatorId:ecosystem.creatorId})


  return {
    status: 200,
    data: {
      templateDetails: template,
      aboutUsDetails: {
        ...ecosystem.toObject(), // Ensure ecosystem is a plain object
        email: creator.email,
        phoneNumber: creatorProfile.phoneNumber || "Not available", // Ensure fallback if no contact is available
      }
    },
  };
};

exports.getReservedTemplate = async (params) => {
  const { templateId } = params; // Extract templateId from the request parameters
  const template = await ReservedTemplate.findOne({ templateId });
  if (!template) {
    return {
      status: 404,
      data: {
        message: "template not found",
      },
    };
  }
  return {
    status: 200,
    data: template,
  };
};

exports.checkDomainAvailability = async (body) => {
  const { domainName } = body;

  if (!domainName) {
    return res.status(400).json({ message: "Domain name is required" });
  }

  const existingEcosystem = await Ecosystem.findOne({
    ecosystemDomain: domainName,
  });

  if (existingEcosystem) {
    const similarNames = generateSimilarDomainNames(domainName);
    const availableSuggestions = [];

    for (const name of similarNames) {
      const existingSuggestion = await Ecosystem.findOne({
        ecosystemDomain: name,
      });
      if (!existingSuggestion) {
        availableSuggestions.push(name);
      }

      if (availableSuggestions.length >= 3) {
        break;
      }
    }

    return {
      status: 200,
      data: {
        message: "Domain name not available",
        suggestions: availableSuggestions,
      },
    };
  } else {
    return {
      status: 200,
      data: {
        message: "Domain name is available",
      },
    };
  }
};

exports.editCreatorTemplate = async (params, body) => {
  const { ecosystemDomain } = params;
  const {
    navbar,
    hero,
    aboutUs,
    Vision,
    Statistics,
    Patrners,
    Events,
    Gallery,
    LargeCta,
    Team,
    Blog,
    Reviews,
    contactUs,
    faq,
    faqStyles,
    footer,
  } = body;

  const requiredFields = [
    "navbar",
    "hero",
    "aboutUs",
    "Vision",
    "Statistics",
    "Patrners",
    "Events",
    "Gallery",
    "LargeCta",
    "Team",
    "Blog",
    "Reviews",
    "contactUs",
    "faq",
    "faqStyles",
    "footer",
  ];

  // Check if required fields are provided
  for (const field of requiredFields) {
    if (!(field in body)) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }

  // Check if the template exists
  const template = await CreatorTemplate.findOne({ ecosystemDomain });
  if (!template) {
    return { status: 404, data: { message: "Template not found" } };
  }

  // Update the template fields
  template.navbar = navbar !== undefined ? navbar : template.navbar;
  template.hero = hero !== undefined ? hero : template.hero;
  template.aboutUs = aboutUs !== undefined ? aboutUs : template.aboutUs;
  template.Vision = Vision !== undefined ? Vision : template.Vision;
  template.Statistics =
    Statistics !== undefined ? Statistics : template.Statistics;
  template.Patrners = Patrners !== undefined ? Patrners : template.Patrners;
  template.Events = Events !== undefined ? Events : template.Events;
  template.Gallery = Gallery !== undefined ? Gallery : template.Gallery;
  template.LargeCta = LargeCta !== undefined ? LargeCta : template.LargeCta;
  template.Team = Team !== undefined ? Team : template.Team;
  template.Blog = Blog !== undefined ? Blog : template.Blog;
  template.Reviews = Reviews !== undefined ? Reviews : template.Reviews;
  template.contactUs = contactUs !== undefined ? contactUs : template.contactUs;
  template.faq = faq !== undefined ? faq : template.faq;
  template.faqStyles = faqStyles !== undefined ? faqStyles : template.faqStyles;
  template.footer = footer !== undefined ? footer : template.footer;

  // Save the updated template
  await template.save();

  return {
    status: 200,
    data: { message: "Template updated successfully", template },
  };
};

exports.withdrawalRequest = async (body) => {
  await WithdrawalRequest.sync();
  const { accountId, creatorId, amount, currency, ecosystemDomain } = body;

  if (!creatorId || !amount || !currency || !accountId || !ecosystemDomain) {
    return {
      status: 400,
      data: {
        message: "Incomplete withdrawal request data",
      },
    };
  }

  const getCreatorEarning = await CreatorEarning.findOne({
    where: { creatorId: creatorId, ecosystemDomain: ecosystemDomain },
  });

  if (!getCreatorEarning) {
    return {
      status: 200,
      data: {
        message: "User has no earnings to withdraw from in this ecosystem",
      },
    };
  }

  const convertedAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/,/g, ""))
      : parseFloat(amount);
  const currencyBalance = getCreatorEarning[currency];

  if (!currencyBalance || currencyBalance < convertedAmount) {
    return {
      status: 400,
      data: {
        message: `Insufficient ${currency} balance for this withdrawal request in ${ecosystemDomain}`,
      },
    };
  }

  const newWithdrawalRequest = await WithdrawalRequest.create({
    creatorId: creatorId,
    amount: convertedAmount,
    currency,
    accountId,
    status: "pending",
    ecosystemDomain,
  });

  getCreatorEarning[currency] -= convertedAmount;
  await getCreatorEarning.save();

  // Fetch creator details to send an email
  const creator = await Creator.findByPk(creatorId);

  await sendWithdrawalRequestEmail({
    organizationName: creator.organizationName,
    email: creator.email,
    amount: convertedAmount.toString(),
    currency,
  });
  // Create a notification for the creator
  const notificationMessage = `Your withdrawal request of ${currency} ${convertedAmount.toFixed(
    2
  )} has been submitted and is pending approval.`;
  const newNotification = new Notification({
    type: "Withdrawal Request",
    message: notificationMessage,
    ecosystemDomain,
    creatorId,
  });

  await newNotification.save();

  // Create an admin notification
  const adminNotificationMessage = `A withdrawal request of ${currency} ${convertedAmount.toFixed(
    2
  )} has been submitted by ${creator.organizationName}.`;
  const adminNotification = new AdminNotification({
    type: "Withdrawal Request",
    message: adminNotificationMessage,
    ecosystemDomain,
    creatorId,
    role: "finance", // Notify the finance team
  });

  await adminNotification.save();

  return {
    status: 201,
    data: {
      message: "Withdrawal request created successfully",
      withdrawalRequest: newWithdrawalRequest,
    },
  };
};
exports.getWithdrawalRequests = async (params) => {
  const { ecosystemDomain } = params;

  const whereClause = ecosystemDomain ? { ecosystemDomain } : {};

  const withdrawalRequests = await WithdrawalRequest.findAll({
    where: whereClause,
    include: {
      model: Account,
      attributes: ["accountNumber", "accountName", "bankName"],
    },
    order: [["createdAt", "DESC"]],
  });

  if (!withdrawalRequests.length) {
    return {
      status: 200,
      data: {
        message: "There are no withdrawal requests",
      },
    };
  }
  return {
    status: 200,
    data: {
      message: withdrawalRequests,
    },
  };
};

exports.makeWithdrawalRequest = async (body) => {
  await WithdrawalRequest.sync();
  const { accountId, creatorId, amount, currency, ecosystemDomain } = body;

  const requiredFields = [
    "ecosystemDomain",
    "creatorId",
    "accountId",
    "currency",
    "amount",
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }

  const getCreatorEarning = await CreatorEarning.findOne({
    where: { creatorId, ecosystemDomain },
  });

  if (!getCreatorEarning) {
    return {
      status: 200,
      data: {
        message: "User has no earning to withdraw from in this ecosystem",
      },
    };
  }

  const convertedAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/,/g, ""))
      : parseFloat(amount);
  const currencyBalance = getCreatorEarning[currency];

  if (!currencyBalance || currencyBalance < convertedAmount) {
    return {
      status: 400,
      data: {
        message: `Insufficient ${currency} balance for this withdrawal request in ${ecosystemDomain}`,
      },
    };
  }

  const newWithdrawalRequest = await WithdrawalRequest.create({
    creatorId,
    amount: convertedAmount,
    currency,
    accountId,
    status: "pending",
    ecosystemDomain,
  });

  // Deduct the amount from the creator's earnings balance
  getCreatorEarning[currency] -= convertedAmount;
  await getCreatorEarning.save();

  const creator = await Creator.findByPk(creatorId);

  await sendWithdrawalRequestEmail({
    organizationName: creator.organizationName,
    email: creator.email,
    amount: convertedAmount.toString(),
    currency,
  });

  // Create a notification for the booking
  const notificationMessage = `Your withdrawal request of ${currency} ${convertedAmount.toFixed(
    2
  )} has been submitted and is pending approval.`;
  const newNotification = new Notification({
    type: "Withdrawal Request",
    message: notificationMessage,
    ecosystemDomain,
    creatorId,
  });

  await newNotification.save();

  const adminNotificationMessage = `A withdrawal request of ${currency} ${convertedAmount.toFixed(
    2
  )} has been submitted by ${creator.organizationName}.`;
  const adminNotification = new AdminNotification({
    type: "Withdrawal Request",
    message: adminNotificationMessage,
    ecosystemDomain,
    creatorId,
    role: "finance", // Notify the finance team
  });

  await adminNotification.save();
  return {
    status: 201,
    data: {
      message: "Withdrawal request created successfully",
      withdrawalRequest: newWithdrawalRequest,
      notification: newNotification,
      adminNotification: adminNotification,
    },
  };
};

exports.totalWithdrawalStats = async (params) => {
  const { ecosystemDomain } = params;
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const whereCondition = ecosystemDomain ? { ecosystemDomain } : {};

  const totalWithdrawals = await WithdrawalRequest.count({
    where: whereCondition,
  });

  const pendingWithdrawals = await WithdrawalRequest.count({
    where: {
      ...whereCondition,
      status: "pending",
    },
  });

  const completedWithdrawals = await WithdrawalRequest.count({
    where: {
      ...whereCondition,
      status: "approved",
    },
  });

  const currentMonthWithdrawals = await WithdrawalRequest.count({
    where: {
      ...whereCondition,
      createdAt: {
        [Op.gte]: startOfMonth,
      },
    },
  });
  return {
    status: 200,
    data: {
      message: totalWithdrawals,
      pendingWithdrawals,
      completedWithdrawals,
      currentMonthWithdrawals,
    },
  };
};
exports.websiteDetails = async (params) => {
  const { ecosystemDomain } = params;

  const userServices = await Service.find({ ecosystemDomain });

  const serviceCount = userServices.reduce(
    (count, service) => count + service.services.length,
    0
  );

  const testimonials = 3;
  const gallery = 6;

  // Define response structure
  return {
    status: 200,
    data: {
      services: serviceCount, // Total service count
      price: serviceCount, // Example: pricing based on count
      testimonials,
      gallery,
    },
  };
};

exports.createService = async (body, file) => {
  const {
    creatorId,
    serviceName,
    ecosystemDomain,
    description,
    homePrice,
    shopPrice,
    pricingFormat,
    deliveryTime,
    currency,
    image,
  } = body;

  const details = [
    "creatorId",
    "serviceName",
    "ecosystemDomain",
    "description",
    "homePrice",
    "shopPrice",
    "pricingFormat",
    "deliveryTime",
    "currency",
    "image",
  ];
  for (const detail of details) {
    if (!body[detail]) {
      return { status: 400, data: { message: `${detail} is required` } };
    }
  }

  const ecosystemData = await Ecosystem.findOne(
    { ecosystemDomain },
    "targetAudienceSector mainObjective"
  );

  if (!ecosystemData) {
    return {
      status: 404,
      data: { message: "Ecosystem not found" },
    };
  }

  const priceData = {
    homePrice: Number(homePrice),
    shopPrice: Number(shopPrice),
  };

  if (isNaN(priceData.homePrice) || isNaN(priceData.shopPrice)) {
    return { status: 400, data: { message: "Prices must be valid numbers" } };
  }

  const service = new serviceCategory({
    creatorId,
    serviceName,
    ecosystemDomain,
    description,
    homePrice,
    shopPrice,
    pricingFormat,
    deliveryTime,
    currency,
    image,
    category: ecosystemData.targetAudienceSector,
    subCategory: ecosystemData.mainObjective,
  });

  await service.save();

  return {
    status: 201,
    data: {
      message: "Service created successfully",
      service,
    },
  };
};

exports.getService = async (params) => {
  const { ecosystemDomain } = params;

  const services = await serviceCategory.find({ ecosystemDomain });

  if (services.length === 0) {
    return {
      status: 404,
      data: {
        message: `No services found for  ${ecosystemDomain} `,
      },
    };
  }

  return {
    status: 200,
    data: {
      message: services,
    },
  };
};

exports.getNotification = async (params) => {
  const { ecosystemDomain } = params;

  // Query only by ecosystemDomain
  const query = { ecosystemDomain };

  const notifications = await Notification.find(query).sort({ date: -1 });

  return {
    status: 200,
    data: {
      message: notifications,
    },
  };
};

exports.markNotificationAsViewed = async (params) => {
  const { notificationId, ecosystemDomain } = params;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, ecosystemDomain, view: false },
    { $set: { view: true } },
    { new: true }
  );

  if (!notification) {
    return {
      status: 404,
      data: { message: "Notification not found or already viewed" },
    };
  }

  return {
    status: 200,
    data: { message: "Notification marked as viewed" },
  };
};

exports.getEcosystemNearMe = async (body) => {
  try {
    const { 
      country, 
      state, 
      localGovernment,
      Category,
      SubCategory,
      format
    } = body;

    // Validate required fields
    const details = ["country", "state", "localGovernment", "Category",
      "SubCategory", "format"];

    for (const detail of details) {
      if (!body[detail]) {
        return { status: 400, data: { message: `${detail} is required` } };
      }
    }

    // Query ecosystems
    const exactMatch = await Ecosystem.find({ country, state, localgovernment: localGovernment, targetAudienceSector: Category, mainObjective: SubCategory, completed: "true"  });
    const stateMatch = await Ecosystem.find({ country, state, targetAudienceSector: Category, mainObjective: SubCategory, completed: "true"  }).lean();
    const countryMatch = stateMatch.length === 0 
      ? await Ecosystem.find({ country, targetAudienceSector: Category, mainObjective: SubCategory, completed: "true" }).lean() 
      : [];

    // Combine results with priority
    let ecosystems = [];
    ecosystems = ecosystems.concat(exactMatch, stateMatch);
    if (exactMatch.length === 0 && stateMatch.length === 0) {
      ecosystems = ecosystems.concat(countryMatch);
    }

    // Include services with ecosystemDomain that match the format
    for (let ecosystem of ecosystems) {
      const services = await Service.find({
        ecosystemDomain: ecosystem.ecosystemDomain,
        format,
      }).lean();

      if (services.length > 0) {
        ecosystem.services = services; // Only add services if they match the format
      } else {
        ecosystem.services = []; // Set to empty if no matching services found
      }
    }

    return { status: 200, data: { ecosystems } };

  } catch (error) {
    console.error("Error fetching ecosystems:", error);
    return { status: 500, data: { message: "Internal server error" } };
  }
};
