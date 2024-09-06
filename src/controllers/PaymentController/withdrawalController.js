const Account = require("../../models/Account");
const Creator = require("../../models/Creator");
const CreatorEarning = require("../../models/CreatorEarning");
const WithdrawalRequest = require("../../models/withdrawalRequest");
const sendWithdrawalRequestEmail = require("../../utils/creatorWithdrawalEmail");
const { Op } = require("sequelize");

const withdrawalRequest = async (req, res) => {
  await WithdrawalRequest.sync();
  try {
    const { accountId, creatorId, amount, currency, ecosystemDomain } =
      req.body;

    if (!creatorId || !amount || !currency || !accountId || !ecosystemDomain) {
      return res
        .status(400)
        .json({ message: "Incomplete withdrawal request data" });
    }

    const getCreatorEarning = await CreatorEarning.findOne({
      where: { creatorId: creatorId, ecosystemDomain: ecosystemDomain },
    });

    if (!getCreatorEarning) {
      return res.status(404).json({
        message: "User has no earnings to withdraw from in this ecosystem",
      });
    }

    const convertedAmount =
      typeof amount === "string"
        ? parseFloat(amount.replace(/,/g, ""))
        : parseFloat(amount);
    const currencyBalance = getCreatorEarning[currency];

    if (!currencyBalance || currencyBalance < convertedAmount) {
      return res.status(400).json({
        message: `Insufficient ${currency} balance for this withdrawal request in ${ecosystemDomain}`,
      });
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

    const creator = await Creator.findByPk(creatorId);

    await sendWithdrawalRequestEmail({
      organizationName: creator.organizationName,
      email: creator.email,
      amount: convertedAmount.toString(),
      currency,
    });

    res.status(201).json({
      message: "Withdrawal request created successfully",
      withdrawalRequest: newWithdrawalRequest,
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getWithdrawalRequests = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;

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
      return res
        .status(404)
        .json({ message: "There are no withdrawal requests" });
    }

    res.status(200).json({ withdrawalRequests });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const totalWithdrawalStats = async (req, res) => {
  const { ecosystemDomain } = req.params; // You can filter by ecosystemDomain if needed
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ); // Start of the current month

  try {
    // Filter withdrawals based on ecosystemDomain if provided
    const whereCondition = ecosystemDomain ? { ecosystemDomain } : {};

    // Fetch all withdrawals
    const totalWithdrawals = await WithdrawalRequest.count({
      where: whereCondition,
    });

    // Fetch pending withdrawals
    const pendingWithdrawals = await WithdrawalRequest.count({
      where: {
        ...whereCondition,
        status: "pending",
      },
    });

    // Fetch completed withdrawals
    const completedWithdrawals = await WithdrawalRequest.count({
      where: {
        ...whereCondition,
        status: "approved",
      },
    });

    // Fetch withdrawals made in the current month
    const currentMonthWithdrawals = await WithdrawalRequest.count({
      where: {
        ...whereCondition,
        createdAt: {
          [Op.gte]: startOfMonth, // Filter for the current month
        },
      },
    });

    return res.status(200).json({
      totalWithdrawals,
      pendingWithdrawals,
      completedWithdrawals,
      currentMonthWithdrawals,
    });
  } catch (error) {
    console.error("Error fetching withdrawal stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  withdrawalRequest,
  getWithdrawalRequests,
  totalWithdrawalStats,
};
