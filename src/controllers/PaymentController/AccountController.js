const Account = require("../../models/Account");
const Creator = require("../../models/Creator");
const CreatorEarning = require("../../models/CreatorEarning");
const Subscription = require("../../models/Subscription")

const saveCreatorAccount = async (req, res) => {
  await Account.sync();
  const {
    creatorId,
    ecosystemDomain,
    accountName,
    accountNumber,
    bankName,
    currency,
  } = req.body;

  const Details = [
    "creatorId",
    "ecosystemDomain",
    "accountName",
    "accountNumber",
    "bankName",
    "currency",
  ];

  for (const detail of Details) {
    if (!req.body[detail]) {
      return res.status(400).json({ message: `${detail} is required` });
    }
  }

  try {
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found." });
    }

    const existingAccount = await Account.findOne({
      where: { accountNumber, creatorId },
    });
    if (existingAccount) {
      return res.status(409).json({
        message:
          "Account with this account number already exists for this creator.",
      });
    }

    const newAccount = await Account.create({
      creatorId,
      ecosystemDomain,
      accountName,
      accountNumber,
      bankName,
      currency,
    });

    return res.status(201).json({
      message: "Bank details saved successfully",
      newAccount,
    });
  } catch (error) {
    console.error("Error saving bank details:", error);
    return res.status(500).json({
      message: "Error saving bank details",
      error: error.message,
    });
  }
};

const getCreatorBankDetails = async (req, res) => {
  try {
    // Access ecosystemDomain from request params
    const { ecosystemDomain } = req.params;

    // Check if ecosystemDomain is provided
    if (!ecosystemDomain) {
      return res.status(400).json({ message: "ecosystemDomain is required" });
    }

    // Find all account details for the given ecosystemDomain
    const accountDetails = await Account.findAll({
      where: { ecosystemDomain },
    });

    if (accountDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No bank details found for this ecosystem." });
    }

    res.status(200).json({ accountDetails });
  } catch (error) {
    console.error("Error retrieving bank details:", error);
    res.status(500).json({
      message: "Error retrieving bank details",
      error: error.message,
    });
  }
};

const editCreatorAccount = async (req, res) => {
  try {
    const { accountId, creatorId, accountName, accountNumber, bankName } =
      req.body;

    // Validate that all required fields are provided
    const requiredFields = [
      "creatorId",
      "accountId",
      "accountName",
      "accountNumber",
      "bankName",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Find the account by ID and creatorId to ensure correct ownership
    const account = await Account.findOne({
      where: { id: accountId, creatorId },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const updateObject = {
      accountName,
      accountNumber,
      bankName,
    };

    await account.update(updateObject);

    res.status(200).json({
      message: "Account updated successfully",
      updatedAccount: account,
    });
  } catch (error) {
    console.error("Error editing account:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const ecosystemEarnings = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;

    if (!ecosystemDomain) {
      return res.status(400).json({ message: "ecosystemDomain is required" });
    }

    const creatorEarnings = await CreatorEarning.findOne({
      where: { ecosystemDomain },
    });

    if (!creatorEarnings || creatorEarnings.length === 0) {
      return res
        .status(404)
        .json({ message: "No earnings found for the given ecosystem" });
    }

    const totalEarnings = creatorEarnings

    const plan = await Subscription.findOne({
      where: {
        creatorId: creatorEarnings.creatorId
      }
    })
    let availableBalance = 0;
    if( totalEarnings.Naira !== 0){
        console.log("this is earning before tax", totalEarnings.Naira)
      if(!plan){
        const getBalance = (totalEarnings.Naira * 7.5) / 100;
        console.log("this is earning after tax", getBalance)
        availableBalance = totalEarnings.Naira - getBalance;
      } else if(plan.planType === "Plus"){
        const getBalance = (totalEarnings.Naira * 4) / 100;
        console.log("this is earning after tax", getBalance)
        availableBalance = totalEarnings.Naira - getBalance;
      } else if(plan.planType === "Pro"){
        const getBalance = (totalEarnings.Naira * 3) / 100;
        console.log("this is earning after tax", getBalance)
        availableBalance = totalEarnings.Naira - getBalance;
      } else {
         const getBalance = (totalEarnings.Naira * 2) / 100;
        console.log("this is earning after tax", getBalance)
        availableBalance = totalEarnings.Naira - getBalance;
      }
    } 

    return res.status(200).json({
      message: `Total earnings for ${ecosystemDomain} ecosystem`,
      totalEarnings,
      availableBalance
    });
  } catch (error) {
    console.error("Error fetching ecosystem earnings:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching earnings" });
  }
};

module.exports = {
  saveCreatorAccount,
  getCreatorBankDetails,
  editCreatorAccount,

  ecosystemEarnings,
};
