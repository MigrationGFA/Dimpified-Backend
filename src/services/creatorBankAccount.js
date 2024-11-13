const Account = require("../models/Account");
const Creator = require("../models/Creator");
const https = require("https");

const payStackBankList = async (req, res) => {
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/bank",
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  };

  try {
    const apiRes = await new Promise((resolve, reject) => {
      const apiReq = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      });

      apiReq.on("error", (error) => {
        reject(error);
      });

      apiReq.end();
    });

    return JSON.parse(apiRes);
  } catch (error) {
    throw error;
  }
};

const paystackBankDetails = async (account, bankCode) => {
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/bank/resolve?account_number=${account}&bank_code=${bankCode}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  };
  try {
    const apiRes = await new Promise((resolve, reject) => {
      const apiReq = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      });

      apiReq.on("error", (error) => {
        reject(error);
      });

      apiReq.end();
    });

    return JSON.parse(apiRes);
  } catch (error) {
    throw error;
  }
};

exports.getAllBanks = async () => {
  const allBanks = await payStackBankList();
  if (!allBanks || !allBanks.data) {
    return { status: 400, data: { message: "Bank list not available" } };
  }
  return { status: 200, data: { allBanks } };
};

exports.verifyBankDetails = async (body) => {
  const { account, bankCode } = body;
  const verifyDetails = await paystackBankDetails(account, bankCode);

  if (!verifyDetails || !verifyDetails.data) {
    return {
      status: 400,
      data: {
        message: "incorrect bank number",
      },
    };
  }
  return { status: 200, data: { verifyDetails } };
};

exports.getCreatorBankDetails = async (params) => {
  const { ecosystemDomain } = params;
  // Check if ecosystemDomain is provided
  if (!ecosystemDomain) {
    return { status: 400, data: { message: "ecosystemDomain is required" } };
  }

  // Find all account details for the given ecosystemDomain
  const accountDetails = await Account.findAll({
    where: { ecosystemDomain },
  });

  if (accountDetails.length === 0) {
    return {
      status: 200,
      data: { message: "No bank details found for this ecosystem." },
    };
  }

  return { status: 200, data: { accountDetails } };
};

exports.saveCreatorAccount = async (body) => {
  await Account.sync();
  const {
    creatorId,
    ecosystemDomain,
    accountName,
    accountNumber,
    bankName,
    currency,
  } = body;

  const Details = [
    "creatorId",
    "ecosystemDomain",
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
  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    return { status: 404, data: { message: "Creator not found." } };
  }

  const existingAccount = await Account.findOne({
    where: { accountNumber, creatorId },
  });
  if (existingAccount) {
    return {
      status: 409,
      data: {
        message:
          "Account with this account number already exists for this creator.",
      },
    };
  }

  const newAccount = await Account.create({
    creatorId,
    ecosystemDomain,
    accountName,
    accountNumber,
    bankName,
    currency,
  });

  return {
    status: 201,
    data: {
      message: "Bank details saved successfully",
      newAccount,
    },
  };
};
