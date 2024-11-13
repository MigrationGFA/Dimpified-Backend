const AffiliateProfile = require("../../models/AffiliateProfile")
const Affiliate = require("../../models/Affiliate");
const AffiliateEarningHistory = require("../../models/AffiliateEarningHistory");
const Creator = require("../../models/Creator");
const Subscribers = require("../../models/Subscription");
const { Op } = require("sequelize");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


exports.getAffiliateProfile = async (params) => {

  const affiliateId = params.affiliateId
  if (!affiliateId) {
    return { status: 400, data: { message: "affiliateid is required" } }
  }

  const affiliateProfile = await AffiliateProfile.findOne({ where: { affiliateId: affiliateId } });

  if (!affiliateProfile) {
    return { status: 200, data: { message: "You have not create your profile" } };
  }
  return { status: 200, data: { affiliateProfile } };

};



exports.createAffiliateProfile = async (body, file) => {
  await AffiliateProfile.sync();
  const {
    affiliateId,
    firstName,
    lastName,
    phoneNumber,
    interestedCategory,
    country,
    state,
    localGovernment,
    domain,
  } = body;

  const details = ["affiliateId", "firstName", "lastName", "phoneNumber", "interestedCategory", "country", "state", "localGovernment", "domain"];

  // Check for required details
  for (const detail of details) {
    if (!body[detail]) {
      return { status: 400, data: { message: `${detail} is required` } };
    }
  }

  let imageUrl = null;

  if (file) {
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "image", // Specify it's an image
    });
    imageUrl = result.secure_url; // Get the Cloudinary image URL
  }

  // if (!affiliateId) {
  //   return { status: 401, data: { message: "Please provide affiliateId" } };
  // }

  // Check if the affiliate exists
  const affiliate = await Affiliate.findByPk(affiliateId);
  if (!affiliate) {
    return { status: 404, data: { message: "Affiliate not found" } };
  }

  // Check if the affiliate profile already exists
  let profile = await AffiliateProfile.findOne({ where: { affiliateId } });

  if (profile) {
    // Update the existing profile
    profile = await profile.update({
      firstName,
      lastName,
      phoneNumber,
      interestedCategory,
      country,
      state,
      localGovernment,
      domain,
      image: imageUrl, // Store the Cloudinary image URL
    });

    return { status: 200, data: { message: "Profile updated successfully", profile } };
  } else {
    // Create a new profile
    profile = await AffiliateProfile.create({
      affiliateId,
      firstName,
      lastName,
      phoneNumber,
      interestedCategory,
      country,
      state,
      localGovernment,
      domain,
      image: imageUrl,
    });

    affiliate.profile = true;
    await affiliate.save();

    return { status: 201, data: { message: "Profile created successfully", profile } };
  }

};


exports.getAffiliateDashboardstat = async (params) => {
  const affiliateId = params.affiliateId;
  if (!affiliateId) {
    return { status: 400, data: { message: "affiliateId is required" } };
  }

  const getAffiliate = await Affiliate.findByPk(affiliateId);
  if (!getAffiliate) {
    return { status: 400, data: { message: "affiliate does not exist" } };
  }
  const totalUser = getAffiliate.onboardedUsers;
  const unverifyUsers = await Creator.count({
    where: {
      affiliateId: affiliateId,
      isVerified: false,
    },
  });
  const getCreator = await Creator.findAll({
    where: {
      affiliateId: affiliateId,
    },
  });

  // Initialize total subscriber count
  let totalSubscribers = 0;

  // Iterate through each creator to count their subscribers
  for (const creator of getCreator) {
    const creatorId = creator.id;

    // Count the number of subscribers for each creator
    const getSubscriberCount = await Subscribers.count({
      where: {
        creatorId: creatorId,
      },
    });
    console.log("this is creator", getCreator);

    // Add to total subscriber count
    totalSubscribers += getSubscriberCount;
  }
  const totalEarningHistory = await AffiliateEarningHistory.count({
    where: {
      affiliateId: affiliateId,
    },
  });
  return {
    status: 200,
    data: { totalUser, unverifyUsers, totalSubscribers, totalEarningHistory },
  };
};

exports.getLastFourOnboardedUsers = async (params) => {
  const affiliateId = params.affiliateId;
  if (!affiliateId) {
    return { status: 400, data: { message: "affiliateId is required" } };
  }
  const lastFourOnboardedUsers = await Creator.findAll({
    where: {
      affiliateId: affiliateId,
    },
    limit: 4,
    order: [["createdAt", "DESC"]],
    attributes: {
      exclude: [
        "password",
        "id",
        "verificationToken",
        "passwordToken",
        "passwordTokenExpirationDate",
      ],
    },
  });
  return { status: 200, data: { lastFourOnboardedUsers } };
};

exports.allAffiliateOnboardUsers = async (params) => {
  const userId = params.userId;
  if (!userId) {
    return { status: 400, data: { message: "userId is required" } };
  }

  const getAllCreator = await Creator.findAll({
    where: {
      affiliateId: userId,
    },
    attributes: {
      exclude: [
        "password",
        "id",
        "verificationToken",
        "passwordToken",
        "passwordTokenExpirationDate",
      ],
    },
  });
  if (!getAllCreator) {
    return { status: 200, data: { message: "You have not onbaord any user" } };
  }
  return { status: 200, data: { getAllCreator } };
};

exports.affiliateUserBlocks = async (params) => {
  const affiliateId = params.affiliateId;

  const creators = await Creator.findAll({
    where: {
      affiliateId: affiliateId,
    },
  });

  const creatorIds = creators.map((creator) => creator.id);

  const uniqueSubscribedUsersCount = await Subscribers.count({
    where: {
      creatorId: {
        [Op.in]: creatorIds,
      },
    },
    distinct: true,
    col: "creatorId",
  });

  const totalUsers = await Creator.count({
    where: {
      affiliateId: affiliateId,
    },
  });

  const verifiedUsers = await Creator.count({
    where: {
      affiliateId: affiliateId,
      isVerified: true,
    },
  });

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const usersThisMonth = await Creator.count({
    where: {
      affiliateId: affiliateId,
      createdAt: {
        [Op.gte]: startOfMonth,
      },
    },
  });

  // 4. Return the results
  return {
    status: 200,
    data: {
      totalUsers,
      verifiedUsers,
      usersThisMonth,
      uniqueSubscribedUsersCount,
    },
  };
};

exports.getLastFourSubscribeUsers = async (params) => {
  const affiliateId = params.affiliateId;
  if (!affiliateId) {
    return { status: 400, data: { message: "affiliateId is required" } };
  }
  const lastFourSubscribers = await AffiliateEarningHistory.findAll({
    where: {
      affiliateId: affiliateId,
    },
    limit: 4,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Creator,
        attributes: ["organizationName", "imageUrl"],
      },
    ],
  });
  if (!lastFourSubscribers) {
    return {
      status: 400,
      data: {
        message: "affiliate does not have any subscriber onborded user",
      },
    };
  }
  return { status: 200, data: { lastFourSubscribers } };
};
