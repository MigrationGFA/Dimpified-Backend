const { Op } = require("sequelize");
const AffiliateWithdrawalRequest = require("../../models/AffiliateWithdrawal")
const Affiliate = require("../../models/Affiliate")
const AffiliateEarning = require("../../models/AffiliateEarning")
const sendWithdrawalRequestEmail = require("../../utils/creatorWithdrawalEmail");
const Account = require("../../models/AffiliateAccount");


const withdrawalRequestAffiliate = async (req, res) => {
  await AffiliateWithdrawalRequest.sync();
  try {
    const { accountId, affiliateId, amount, currency } =
      req.body;

    if (!affiliateId || !amount || !currency || !accountId ) {
      return res
        .status(400)
        .json({ message: "Incomplete withdrawal request data" });
    }

    const getAffiliateEarning = await AffiliateEarning.findOne({
      where: {   affiliateId: affiliateId },
    });
    console.log("this is earning", getAffiliateEarning)

    if (!getAffiliateEarning) {
      return res.status(200).json({
        message: "User has no earnings to withdraw from",
      });
    }

    const convertedAmount =
      typeof amount === "string"
        ? parseFloat(amount.replace(/,/g, ""))
        : parseFloat(amount);
    const currencyBalance = getAffiliateEarning[currency];
    console.log("")

    if (!currencyBalance || currencyBalance < convertedAmount) {
      return res.status(400).json({
        message: `Insufficient ${currency} balance for this withdrawal request`,
      });
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

    return res.status(201).json({
      message: "Withdrawal request created successfully",
      withdrawalRequest: newWithdrawalRequest,
    });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAffiliateWithdrawalRequests = async (req, res) => {
  try {
    const { affiliateId } = req.params;
     if(!affiliateId){
             return res.status(400).json({ message: "affiliateId is required" });
        }
    
    const withdrawalRequests = await AffiliateWithdrawalRequest.findAll({
      where: {
        affiliateId: affiliateId
      },
      include: {
        model: Account,
        attributes: ["accountNumber", "accountName", "bankName"],
      },
      order: [["createdAt", "DESC"]],
    });

    if (!withdrawalRequests.length) {
      return res
        .status(200)
        .json({ message: "There are no withdrawal requests" });
    }

    res.status(200).json({ withdrawalRequests });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const affiliateTotalWithdrawalStats = async (req, res) => {
  const { affiliateId } = req.params;
     if(!affiliateId){
             return res.status(400).json({ message: "affiliateId is required" });
        }
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  try {

    const totalWithdrawals = await AffiliateWithdrawalRequest.count({
      where: {
        affiliateId: affiliateId
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
    withdrawalRequestAffiliate,
    getAffiliateWithdrawalRequests,
    affiliateTotalWithdrawalStats
}