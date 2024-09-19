const AffiliateAccount = require("../../models/AffiliateAccount");
const Affiliate = require("../../models/Affiliate");

const saveAffiliateAccount = async (req, res) => {
  await AffiliateAccount.sync();
  const { affiliateId, accountName, accountNumber, bankName, currency } =
    req.body;

  const Details = [
    "affiliateId",
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

    const affiliate = await Affiliate.findByPk(affiliateId);
    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found." });
    }

    const existingAccount = await AffiliateAccount.findOne({
      where: { accountNumber, affiliateId },
    });
    if (existingAccount) {
      return res.status(409).json({
        message:
          "Account with this account number already exists for this affiliate.",
      });
    }

    const newAccount = await AffiliateAccount.create({
      affiliateId,
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

const getAffiliateBankDetails = async (req, res) => {
  try {
    const { affiliateId } = req.params;

    if (!affiliateId) {
      return res.status(400).json({ message: "affiliateId is required" });
    }

    const accountDetails = await AffiliateAccount.findAll({
      where: { affiliateId },
    });

    if (accountDetails.length === 0) {
      return res
        .status(200)
        .json({ message: "No bank details found for this affiliate." });
    }

    return res.status(200).json({ accountDetails });
  } catch (error) {
    console.error("Error retrieving bank details:", error);
    res.status(500).json({
      message: "Error retrieving bank details",
      error: error.message,
    });
  }
};

const editAffiliateAccount = async (req, res) => {
  try {
    const { accountId, affiliateId, accountName, accountNumber, bankName } =
      req.body;

    const requiredFields = [
      "affiliateId",
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

    const account = await AffiliateAccount.findOne({
      where: { id: accountId, affiliateId },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    await account.update({ accountName, accountNumber, bankName });

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

module.exports = {
  saveAffiliateAccount,
  getAffiliateBankDetails,
  editAffiliateAccount,
};
