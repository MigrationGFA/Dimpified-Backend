const Account = require("../../models/Account");
const Creator = require("../../models/Creator");
const CreatorEarning = require("../../models/CreatorEarning");
const WithdrawalRequest = require("../../models/withdrawalRequest");
const sendWithdrawalRequestEmail = require("../../utils/creatorWithdrawalEmail");

const withdrawalRequest = async (req, res) => {
  await WithdrawalRequest.sync();
  try {
    const { accountId, creatorId, amount, currency, ecosystemDomain } =
      req.body;

    // Validate request data
    if (!creatorId || !amount || !currency || !accountId || !ecosystemDomain) {
      return res
        .status(400)
        .json({ message: "Incomplete withdrawal request data" });
    }

    // Check if the creator has earnings in the specified ecosystem domain
    const getCreatorEarning = await CreatorEarning.findOne({
      where: { creatorId: creatorId, ecosystemDomain: ecosystemDomain },
    });

    if (!getCreatorEarning) {
      return res.status(404).json({
        message: "User has no earnings to withdraw from in this ecosystem",
      });
    }

    // Convert the amount to a float
    const convertedAmount =
      typeof amount === "string"
        ? parseFloat(amount.replace(/,/g, ""))
        : parseFloat(amount);
    const currencyBalance = getCreatorEarning[currency];

    // Check if the user has enough balance in the specified ecosystem
    if (!currencyBalance || currencyBalance < convertedAmount) {
      return res.status(400).json({
        message: `Insufficient ${currency} balance for this withdrawal request in ${ecosystemDomain}`,
      });
    }

    // Create a new withdrawal request
    const newWithdrawalRequest = await WithdrawalRequest.create({
      creatorId: creatorId,
      amount: convertedAmount,
      currency,
      accountId,
      status: "pending",
      ecosystemDomain,
    });

    // Update the creator's earnings by deducting the withdrawn amount
    getCreatorEarning[currency] -= convertedAmount;
    await getCreatorEarning.save();

    // Fetch creator's details
    const creator = await Creator.findByPk(creatorId);

    // Send withdrawal request email to the creator
    await sendWithdrawalRequestEmail({
      organizationName: creator.organizationName,
      email: creator.email,
      amount: convertedAmount.toString(),
      currency,
    });

    // Respond with success
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

// const getMyWithdrawalRequests = async (req, res) => {
//   const { creatorId } = req.params;
//   try {
//     const withdrawalRequests = await WithdrawalRequest.findAll({
//       where: { creatorId },
//       include: {
//         model: Account,
//         attributes: ["accountNumber", "accountName", "bankName"],
//       },
//       order: [["createdAt", "DESC"]],
//     });

//     if (!withdrawalRequests.length) {
//       return res
//         .status(404)
//         .json({ message: "There are no withdrawal requests for this creator" });
//     }

//     res.status(200).json({ withdrawalRequests });
//   } catch (error) {
//     console.error("Error fetching withdrawal requests:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

const getMyWithdrawalRequests = async (req, res) => {
  const { creatorId } = req.params;
  const { ecosystemDomain } = req.body;

  try {
    const whereClause = { creatorId };
    if (ecosystemDomain) {
      whereClause.ecosystemDomain = ecosystemDomain;
    }

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
