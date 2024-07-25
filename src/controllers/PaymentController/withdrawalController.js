const Account = require("../../models/Account");
const Creator = require("../../models/Creator");
const CreatorEarning = require("../../models/CreatorEarning");
const WithdrawalRequest = require("../../models/withdrawalRequest");
const sendWithdrawalRequestEmail = require("../../utils/creatorWithdrawalEmail");

const withdrawalRequest = async (req, res) => {
  await WithdrawalRequest.sync();
  try {
    const { accountId, creatorId, amount, currency } = req.body;

    if (!creatorId || !amount || !currency || !accountId) {
      return res
        .status(400)
        .json({ message: "Incomplete withdrawal request data" });
    }

    const getCreatorEarning = await CreatorEarning.findOne({
      where: { creatorId: creatorId },
    });

    if (!getCreatorEarning) {
      return res
        .status(404)
        .json({ message: "User has no earnings to withdraw from" });
    }

    const convertedAmount =
      typeof amount === "string"
        ? parseFloat(amount.replace(/,/g, ""))
        : parseFloat(amount);
    const currencyBalance = getCreatorEarning[currency];

    if (!currencyBalance || currencyBalance < convertedAmount) {
      return res.status(400).json({
        message:
          "You do not have sufficient amount to make this withdrawal request",
      });
    }

    const newWithdrawalRequest = await WithdrawalRequest.create({
      creatorId: creatorId,
      amount: convertedAmount,
      currency,
      accountId,
      status: "pending",
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
    const withdrawalRequests = await WithdrawalRequest.findAll({
      include: {
        model: Account,
        attributes: ["accountNumber", "accountName", "bankName"],
      },
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
const getMyWithdrawalRequests = async (req, res) => {
  const { creatorId } = req.params;
  try {
    const withdrawalRequests = await WithdrawalRequest.findAll({
      where: { creatorId },
      include: {
        model: Account,
        attributes: ["accountNumber", "accountName", "bankName"],
      },
    });

    if (!withdrawalRequests.length) {
      return res
        .status(404)
        .json({ message: "There are no withdrawal requests for this creator" });
    }

    res.status(200).json({ withdrawalRequests });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  withdrawalRequest,
  getWithdrawalRequests,
  getMyWithdrawalRequests,
};
