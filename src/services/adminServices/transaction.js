const { Op } = require("sequelize");
const Creator = require("../../models/Creator");
const EcosystemTransaction = require("../../models/ecosystemTransaction");
const EcosystemUser = require("../../models/EcosystemUser");
const Ecosystem = require("../../models/Ecosystem");
const CreatorProfile = require("../../models/CreatorProfile");
const {
  getAllEcosystemTransactions,
} = require("../../controllers/AdminController/procedure");
const WithdrawalRequest = require("../../models/withdrawalRequest");
const Account = require("../../models/Account");
const CreatorEarning = require("../../models/CreatorEarning");
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

exports.transactionDetails = async () => {
  // Fetch all creators
  // const creators = await Creator.findAll({
  //   attributes: ["id", "organizationName"],
  // });

  // console.log("Fetched Creators:", JSON.stringify(creators, null, 2)); // Log creators

  // // Fetch all earnings
  // const earnings = await CreatorEarning.findAll({
  //   attributes: ["creatorId", "Naira", "Dollar"],
  // });

  // console.log("Fetched Earnings:", JSON.stringify(earnings, null, 2)); // Log earnings

  // // Fetch all approved withdrawal requests
  // const withdrawals = await WithdrawalRequest.findAll({
  //   where: { status: "approved" },
  //   attributes: ["creatorId", "amount", "currency"],
  // });

  // console.log("Fetched Withdrawals:", JSON.stringify(withdrawals, null, 2)); // Log withdrawals

  // // Merge data
  // const financialDetails = creators.map((creator) => {
  //   const { id, organizationName } = creator;

  //   const earning = earnings.find((e) => e.creatorId === id) || {
  //     Naira: 0,
  //     Dollar: 0,
  //   };

  //   const totalWithdrawn = withdrawals
  //     .filter((w) => w.creatorId === id)
  //     .reduce(
  //       (totals, withdrawal) => {
  //         if (withdrawal.currency === "Naira") {
  //           totals.Naira += parseFloat(withdrawal.amount);
  //         } else if (withdrawal.currency === "Dollar") {
  //           totals.Dollar += parseFloat(withdrawal.amount);
  //         }
  //         return totals;
  //       },
  //       { Naira: 0, Dollar: 0 }
  //     );

  //   return {
  //     creatorId: id,
  //     creatorName: organizationName,
  //     balance: {
  //       Naira: parseFloat(earning.Naira),
  //       Dollar: parseFloat(earning.Dollar),
  //     },
  //     totalWithdrawn,
  //   };
  // });

  // console.log(
  //   "Final Financial Details:",
  //   JSON.stringify(financialDetails, null, 2)
  // ); // Log final results

  // return {
  //   status: 200,
  //   data: {
  //     message: "Financial details retrieved successfully",
  //     financialDetails,
  //   },
  // };

  // Fetch all withdrawal requests
  const withdrawals = await WithdrawalRequest.findAll({
    attributes: [
      "id",
      "amount",
      "status",
      "requestedAt",
      "processedAt",
      "creatorId",
    ],
    order: [["requestedAt", "DESC"]],
  });

  // Fetch all creator earnings
  const earnings = await CreatorEarning.findAll({
    attributes: ["creatorId", "Naira", "Dollar"],
  });

  // Fetch creator profiles
  const creatorProfiles = await CreatorProfile.find(
    {},
    { creatorId: 1, fullName: 1 } // Only fetch creatorId and fullName
  );

  // Create a map for quick access to full names
  const creatorFullNameMap = creatorProfiles.reduce((acc, profile) => {
    acc[profile.creatorId] = profile.fullName;
    return acc;
  }, {});

  // Combine the data
  const financialDetails = withdrawals.map((withdrawal) => {
    const earning = earnings.find((e) => e.creatorId === withdrawal.creatorId);
    const fullName = creatorFullNameMap[withdrawal.creatorId] || "Unknown";

    return {
      id: withdrawal.id,
      fullName,
      amount: withdrawal.amount,
      // currency: withdrawal.currency,
      status: withdrawal.status,
      requestedAt: withdrawal.requestedAt,
      processedAt: withdrawal.processedAt,
      balance: {
        Naira: earning ? earning.Naira : 0,
        Dollar: earning ? earning.Dollar : 0,
      },
    };
  });

  return {
    status: 200,
    data: {
      message: "Financial details retrieved successfully",
      financialDetails,
    },
  };
};

exports.endUserTransaction = async () => {
  // Fetch all users
  const users = await EcosystemUser.findAll();

  // Fetch all transactions
  const transactions = await EcosystemTransaction.findAll();

  // Fetch all creators
  const creators = await Creator.findAll();

  // Fetch all withdrawal requests, sorted by ID in ascending order
  const withdrawals = await WithdrawalRequest.findAll({});

  // Map user details with their transactions
  const endUserDetails = users
    .map((user) => {
      const userTransactions = transactions.filter(
        (transaction) => transaction.userId === user.id
      );

      // If no transactions, return default data
      if (userTransactions.length === 0) {
        return {
          userName: user.username,
          ecosystemDomain: user.ecosystemDomain,
          service: null,
          amountPaid: 0,
          date: null,
          time: null,
          status: "No transactions",
        };
      }

      // Otherwise, map the transactions for the user
      return userTransactions.map((transaction) => ({
        userName: user.username,
        ecosystemDomain: transaction.ecosystemDomain,
        service: transaction.itemTitle,
        amountPaid: parseFloat(transaction.amount),
        date: transaction.transactionDate.toISOString().split("T")[0],
        time: transaction.transactionDate
          .toISOString()
          .split("T")[1]
          .split(".")[0],
        status: transaction.status,
      }));
    })
    .flat();

  // Map creator details along with their withdrawals and ecosystem domain
  const creatorDetails = await Promise.all(
    creators.map(async (creator) => {
      // Fetch the associated Ecosystem for the creator to get ecosystemDomain
      const ecosystem = await Ecosystem.findOne({
        creatorId: creator.id, // Matching the creatorId
      });

      // Filter withdrawals for this creator
      const creatorWithdrawals = withdrawals.filter(
        (withdrawal) => withdrawal.creatorId === creator.id
      );

      return {
        id: creator.id,
        creatorName: creator.organizationName,
        ecosystemDomain: ecosystem ? ecosystem.ecosystemDomain : "N/A", // Handle missing ecosystem domain
        balance: parseFloat(creator.balance || 0).toFixed(2),
        withdrawals: creatorWithdrawals.map((withdrawal) => ({
          amountWithdrawn: parseFloat(withdrawal.amount),
          date: withdrawal.requestedAt.toISOString().split("T")[0],
          time: withdrawal.requestedAt
            .toISOString()
            .split("T")[1]
            .split(".")[0],
          status: withdrawal.status,
        })),
      };
    })
  );

  return {
    status: 200,
    data: {
      creatorAccount: creatorDetails,
      endUser: endUserDetails,
    },
  };
};
