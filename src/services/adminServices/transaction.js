const { Op } = require("sequelize");
const Creator = require("../../models/Creator");
const ecosystemTransaction = require("../../models/ecosystemTransaction");
const {
  getAllEcosystemTransactions,
} = require("../../controllers/AdminController/procedure");
const WithdrawalRequest = require("../../models/withdrawalRequest");
const Account = require("../../models/Account");
const { createTransport } = require("nodemailer");

exports.ecosystemTransactions = async (req, res) => {
  try {
    const transactions = await getAllEcosystemTransactions();
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error in /api/ecosystem-transactions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions.",
    });
  }
};

exports.getWithdrawalDetails = async () => {
  // // Fetch all creators with id, email, and isVerified status
  // const creators = await Creator.findAll({
  //   attributes: ["id"],
  //   order: [["createdAt", "DESC"]],
  // });

  // if (!creators.length) {
  //   return {
  //     status: 200,
  //     data: [],
  //     message: "No creators found.",
  //   };
  // }

  // // Extract creator IDs
  // const creatorIds = creators.map((creator) => creator.id);

  // // Fetch Accounts (even if there are no withdrawals)
  // const accounts = await Account.findAll({
  //   where: { creatorId: creatorIds },
  //   attributes: ["creatorId", "accountName", "accountNumber", "bankName"],
  // });

  // const withdrawals = await WithdrawalRequest.findAll({
  //   where: { creatorId: creatorIds },
  //   attributes: ["creatorId", "requestedAt", "amount", "status"],
  // });

  // // Map accounts to creatorId
  // const accountMap = accounts.reduce((map, account) => {
  //   map[account.creatorId] = {
  //     accountName: account.accountName,
  //     accountNumber: account.accountNumber,
  //     bankName: account.bankName,
  //   };
  //   return map;
  // }, {});

  // const withdrawalMap = withdrawals.reduce((map, withdrawal) => {
  //   map[withdrawal.creatorId].push({
  //     amount: withdrawal.amount,
  //     requestedAt: withdrawal.requestedAt,
  //     status: withdrawal.status,
  //   });
  //   return map;
  // }, {});

  // // Prepare user data
  // const users = creators.map((creator) => {
  //   const account = accountMap[creator.id] || {};
  //   const withdrawal = withdrawalMap[creator.id] || {};
  //   return {
  //     id: creator.id,
  //     accountName: account.accountName || null,
  //     accountNumber: account.accountNumber || null,
  //     bankName: account.bankName || null,
  //     amount: withdrawal.amount || null,
  //     requestedAt: withdrawal.requestedAt || null,
  //     status: withdrawal.status || null,
  //   };
  // });

  // // Return the response
  // return {
  //   status: 200,
  //   data: users,
  // };

  const creators = await Creator.findAll({
    attributes: ["id"],
    order: [["createdAt", "DESC"]],
  });

  if (!creators.length) {
    return {
      status: 200,
      data: [],
      message: "No creators found.",
    };
  }

  // Extract creator IDs
  const creatorIds = creators.map((creator) => creator.id);

  // Fetch accounts for the specified creatorIds
  const accounts = await Account.findAll({
    where: { creatorId: creatorIds },
    attributes: [
      "id",
      "creatorId",
      "accountName",
      "accountNumber",
      "bankName",
      "currency",
    ],
    include: [
      {
        model: WithdrawalRequest,
        attributes: ["amount", "status", "requestedAt", "processedAt"],
      },
    ],
  });

  if (!accounts.length) {
    return {
      status: 404,
      data: [],
      message: "No accounts or withdrawals found for the specified criteria.",
    };
  }

  // Prepare response
  const response = accounts.map((account) => {
    // Use reduce to process withdrawals
    const withdrawals = account.WithdrawalRequests.reduce((acc, withdrawal) => {
      acc.push({
        amount: withdrawal.amount !== null ? withdrawal.amount : 0,
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt,
        processedAt: withdrawal.processedAt,
      });
      return acc;
    }, []);

    // Default withdrawal if no withdrawals exist
    if (withdrawals.length === 0) {
      withdrawals.push({
        amount: 0,
        status: "N/A",
        requestedAt: "N/A",
        processedAt: "N/A",
      });
    }

    return {
      creatorId: account.creatorId,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      currency: account.currency,
      withdrawals,
    };
  });

  return {
    status: 200,
    data: response,
  };
};
exports.walletBalance = async () => {
  const balance = await ecosystemTransaction.findAll();
  return {
    status: 200,
    data: {
      message: balance,
    },
  };
};
