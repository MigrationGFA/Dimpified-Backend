const Creator = require("../models/Creator");
const CreatorSupport = require("../models/Support");
const sendCreatorSupportRequestFeedback = require("../utils/sendCreatorSupportFeedbackEmail");
//const sendHelpRequestFeedback = require("../../utils/sendHelpRequestFeedback");
const sendSupportRequestCompletedEmail = require("../utils/supportRequestCompleted");

exports.creatorSupportRequest = async (body) => {
  await CreatorSupport.sync();
  const { reason, message, creatorId, ecosystemDomain } = body;
  const details = ["reason", "message", "creatorId"];

  for (const detail of details) {
    if (!body[detail]) {
      return {
        status: 400,
        data: { message: `${detail} is required` },
      };
    }
  }

  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    return {
      status: 404,
      data: { message: "Creator not found" },
    };
  }

  const createSupport = await CreatorSupport.create({
    reason,
    message,
    creatorId,
    ecosystemDomain,
  });

  return {
    status: 201,
    data: {
      message: "Your support request has been sent",
      data: createSupport,
    },
  };
};

exports.allCreatorSupportRequest = async (params) => {
  const { ecosystemDomain } = params;
  if (!ecosystemDomain) {
    return {
      status: 400,
      message: "EcosystemDomain is missing",
    };
  }

  const supportRequestsByDomain = await CreatorSupport.findAll({
    where: {
      ecosystemDomain: ecosystemDomain,
    },
    order: [["createdAt", "DESC"]],
  });

  return {
    status: 200,
    data: {
      supportRequestsByDomain,
    },
  };
};

exports.getSupportSummaryByDomain = async (params) => {
  const { ecosystemDomain } = params;

  if (!ecosystemDomain) {
    return {
      status: 400,
      message: "EcosystemDomain is missing",
    };
  }

  // Fetch total, pending, and completed support counts
  const totalSupport = await CreatorSupport.count({
    where: { ecosystemDomain },
  });

  const pendingSupport = await CreatorSupport.count({
    where: {
      ecosystemDomain,
      status: "pending",
    },
  });

  const completedSupport = await CreatorSupport.count({
    where: {
      ecosystemDomain,
      status: "completed",
    },
  });

  // Fetch all support requests for this ecosystemDomain
  const supportRequests = await CreatorSupport.findAll({
    where: { ecosystemDomain },
    order: [["createdAt", "DESC"]],
  });

  return {
    status: 200,
    data: {
      totalSupport,
      pendingSupport,
      completedSupport,
      supportRequests,
    },
  };
};
