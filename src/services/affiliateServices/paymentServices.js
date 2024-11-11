const AffiliateWithdrawalRequest = require("../../models/AffiliateWithDrawRequest");
const Affiliate = require("../../models/Affiliate");
const sendWithdrawalRequestEmail = require("../../utils/creatorWithdrawalEmail");
const AffiliateEarning = require("../../models/AffiliateEarning");
const Op = require("sequelize");
const AffiliateEarningHistory = require("../../models/AffiliateEarningHistory")

exports.affliateWithdrawalRequest = async (body) => {
  await AffiliateWithdrawalRequest.sync();
  const { accountId, affiliateId, amount, currency } = body;

  if (!affiliateId || !amount || !currency || !accountId) {
    return {
      status: 400,
      data: {
        message: "Incomplete withdrawals request data",
      },
    };
  }

  const getAffiliateEarning = await AffiliateEarning.findOne({
    where: { affiliateId: affiliateId },
  });
  console.log("this is earning", getAffiliateEarning);

  if (!getAffiliateEarning) {
    return {
      status: 200,
      data: {
        message: "User has no earnings to withdraw from",
      },
    };
  }

  const convertedAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/,/g, ""))
      : parseFloat(amount);
  const currencyBalance = getAffiliateEarning[currency];
  console.log("");

  if (!currencyBalance || currencyBalance < convertedAmount) {
    return {
      status: 400,
      data: {
        message: `Insufficient ${currency} balance for this withdrawal request`,
      },
    };
  }

  const newWithdrawalRequest = await AffiliateWithdrawalRequest.create({
    affiliateId: affiliateId,
    amount: convertedAmount,
    currency,
    accountId,
    status: "pending",
  });

  getAffiliateEarning[currency] -= convertedAmount;
  await getAffiliateEarning.save();

  const affiliate = await Affiliate.findByPk(affiliateId);

  await sendWithdrawalRequestEmail({
    organizationName: affiliate.userName,
    email: affiliate.email,
    amount: convertedAmount.toString(),
    currency,
  });

  return {
    status: 201,
    data: {
      message: "Withdrawal request created successfully",
      withdrawalRequest: newWithdrawalRequest,
    },
  };
};

exports.getAffiliateWithdrawRequest = async (params) => {
  const { affiliateId } = params;
  if (!affiliateId) {
    return {
      status: 400,
      data: {
        message: "affiliateId is required",
      },
    };
  }

  const withdrawalRequests = await AffiliateWithdrawalRequest.findAll({
    where: {
      affiliateId: affiliateId,
    },
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
        message: "There are no withdrawals requests",
      },
    };
  }

  return {
    status: 200,
    data: {
      withdrawalRequests,
    },
  };
};

exports.affiliateEarningAccount = async (params) => {
  const { affiliateId } = params;
  if (!affiliateId) {
    return {
      status: 409,
      data: {
        message:
          "Account with this account number already exists for this creator.",
      },
    };
  }
  const affiliateEarning = await AffiliateEarning.findOne({
    where: {
      affiliateId: affiliateId,
    },
  });
  if (!affiliateEarning) {
    return res.status(200).json({ message: "affiliate does not have earning" });
  }
  return {
    status: 200,
    data: {
      message: "affiliate earning",
      affiliateEarning,
    },
  };
};

exports.affiliateEarningHistory = async (params) => {
  const affiliateId = params;
  if (!affiliateId) {
    return res.status(400).json({ message: "affiliateId is required" });
  }
  const affiliateEarningHistory = await AffiliateEarningHistory.findAll({
    where: {
      affiliateId: affiliateId,
    },
    order: [["createdAt", "DESC"]],
  });
  if (!affiliateEarningHistory) {
    return {
      status: 200,
      data: {
        message: "affiliate does not have any earning history",
      },
    };
  } else {
    return {
      status: 200,
      data: {
        affiliateEarningHistory,
      },
    };
  }
};

exports.affiliateTotalWithdrawalStats = async (params) => {
  const { affiliateId } = params;
  if (!affiliateId) {
    return res.status(400).json({ message: "affiliateId is required" });
  }
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  const totalWithdrawals = await AffiliateWithdrawalRequest.count({
    where: {
      affiliateId: affiliateId,
    },
  });

  const pendingWithdrawals = await AffiliateWithdrawalRequest.count({
    where: {
      affiliateId: affiliateId,
      status: "pending",
    },
  });

  const completedWithdrawals = await AffiliateWithdrawalRequest.count({
    where: {
      affiliateId: affiliateId,
      status: "approved",
    },
  });

  const currentMonthWithdrawals = await AffiliateWithdrawalRequest.count({
    where: {
      affiliateId: affiliateId,
      createdAt: {
        [Op.gte]: startOfMonth,
      },
    },
  });

  return {
    status: 200,
    data: {
      totalWithdrawals,
      pendingWithdrawals,
      completedWithdrawals,
      currentMonthWithdrawals,
    },
  };
};




exports.getAffiliateEarning = async (params) => {
  const affiliateId = params
  if (!affiliateId) {
    return { status: 400, data: { message: "affiliateId is required" } };
  }
  const affiliateEarning = await AffiliateEarning.findOne({
    where: {
      affiliateId: affiliateId
    }
  })
  if (!affiliateEarning) {
    return { status: 200, data: { message: "affiliate does not have earning" } };
  }
  return { status: 200, data: { affiliateEarning } };
}

