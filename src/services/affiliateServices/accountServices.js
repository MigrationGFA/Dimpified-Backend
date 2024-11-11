const AffiliateAccount = require("../../models/AffiliateAccount");

const Affiliate = require("../../models/Affiliate")
exports.saveAffiliateAccount = async (body) => {
  await AffiliateAccount.sync();
  const { affiliateId, accountName, accountNumber, bankName, currency } = body;

  const Details = [
    "affiliateId",
    "accountName",
    "accountNumber",
    "bankName",
    "currency",
  ];

  for (const detail of Details) {
    if (!body[detail]) {
      return { status: 400, data: { message: `${detail} is required` } };
    }
  }

  const affiliate = await Affiliate.findByPk(affiliateId);
  if (!affiliate) {
    return { status: 400, data: { message: "Affiliate not found" } };
  }

  const existingAccount = await AffiliateAccount.findOne({
    where: { accountNumber, affiliateId },
  });
  if (existingAccount) {
    return {
      status: 400,
      data: {
        message:
          "Account with this account number already exists for this affiliate.",
      },
    };
  }

  const newAccount = await AffiliateAccount.create({
    affiliateId,
    accountName,
    accountNumber,
    bankName,
    currency,
  });

  return {
    status: 400,
    data: {
      message: "Bank details saved successfully",
      newAccount,
    },
  };
};

exports.getAffiliateBankDetails = async (params) => {
  const { affiliateId } = params;

  if (!affiliateId) {
    return { status: 400, data: { message: "Affiliate Id is required" } };
  }

  const accountDetails = await AffiliateAccount.findAll({
    where: { affiliateId },
  });

  if (accountDetails.length === 0) {
    return {
      status: 200,
      data: {
        message: "No bank details found for this affiliate",
      },
    };
  } else {
    return {
      status: 200,
      data: {
        accountDetails,
      },
    };
  }
};

exports.editAffiliateBankDetails = async (body) => {
  const { accountId, affiliateId, accountName, accountNumber, bankName } = body;

  const requiredFields = [
    "affiliateId",
    "accountId",
    "accountName",
    "accountNumber",
    "bankName",
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      return { status: 400, data: { message: "Affiliate Id is required" } };
    }
  }

  const account = await AffiliateAccount.findOne({
    where: { id: accountId, affiliateId },
  });

  if (!account) {
    return { status: 404, data: { message: "Account not found" } };
  }

  await account.update({ accountName, accountNumber, bankName });
  return {
    status: 200,
    data: {
      message: "Account Updated Successfuly",
      updatedAccount: account,
    },
  };
};
