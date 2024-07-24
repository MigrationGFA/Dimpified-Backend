const Account = require("../../models/Account");
const Creator = require("../../models/Creator");
const CreatorEarning = require("../../models/CreatorEarning");

const saveCreatorAccount = async (req, res) => {
  await Account.sync();
  const { creatorId, accountName, accountNumber, bankName, currency } =
    req.body;
  const details = [
    "creatorId",
    "accountName",
    "accountNumber",
    "bankName",
    "currency",
  ];
  // Check if userId is provided
  for (const detail of details) {
    if (!req.body[detail]) {
      return res.status(400).json({ message: `${detail} is required` });
    }
  }
  try {
    // Find the user by ID to ensure they exist
    const user = await Creator.findByPk(creatorId);
    if (!user) {
      return res.status(404).json({ message: "Creator not found." });
    }
    const newAccount = await Account.create({
      creatorId,
      accountName,
      accountNumber,
      bankName,
      currency,
    });
    return res
      .status(201)
      .json({ message: "Bank details saved successfully", newAccount });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error saving bank details", error: error.message });
  }
};

const getCreatorBankDetails = async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const accountDetails = await Account.findAll({ where: { creatorId } });

    res.status(200).json({ accountDetails });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error retrieving bank details", error: error.message });
  }
};

const editCreatorAccount = async (req, res) => {
  try {
    const { accountId, creatorId, accountName, accountNumber, bankName } =
      req.body;
    const details = ["creatorId", "accountId"];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const account = await Account.findOne({
      where: { id: accountId, creatorId: creatorId },
    });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Prepare the update object
    const updateObject = {};

    // Add accountNumber and bankName to the updateObject if provided
    if (accountName !== undefined) {
      updateObject.accountName = accountName;
    }
    if (accountNumber !== undefined) {
      updateObject.accountNumber = accountNumber;
    }
    if (bankName !== undefined) {
      updateObject.bankName = bankName;
    }

    // Update the account details
    await account.update(updateObject);

    res.status(200).json({ message: "Account updated successfully" });
  } catch (error) {
    console.error("Error editing account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCreatorEarning = async (req, res) => {
  const { creatorId } = req.params;

  try {
    if (!creatorId) {
      return res.status(400).json({ message: "creatorId is required" });
    }

    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const creatorEarning = await CreatorEarning.findOne({
      where: { creatorId },
    });

    if (!creatorEarning) {
      return res
        .status(404)
        .json({ message: "Earnings not found for this creator" });
    }

    res.status(200).json({
      Naira: creatorEarning.Naira,
      Dollar: creatorEarning.Dollar,
    });
  } catch (error) {
    console.error("Error fetching creator earnings:", error);
    res.status(500).json({ message: "Failed to fetch creator earnings" });
  }
};

module.exports = {
  saveCreatorAccount,
  getCreatorBankDetails,
  editCreatorAccount,
  getCreatorEarning,
};
