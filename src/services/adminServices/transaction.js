const { Op } = require("sequelize");
const Creator = require("../../models/Creator");
const ecosystemTransaction = require("../../models/ecosystemTransaction");
const EcosystemUser = require("../../models/EcosystemUser");
const Ecosystem = require("../../models/Ecosystem");
const CreatorProfile = require("../../models/CreatorProfile");
const Subscription = require("../../models/Subscription");
const {
  getAllEcosystemTransactions,
} = require("../../controllers/AdminController/procedure");
const WithdrawalRequest = require("../../models/withdrawalRequest");
const Account = require("../../models/Account");
const CreatorEarning = require("../../models/CreatorEarning");
const Booking = require("../../models/DimpBooking");
const { createTransport } = require("nodemailer");
const AdminUser = require("../../models/AdminUser");

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

// exports.getWithdrawalDetails = async () => {
//   // Fetch all withdrawal requests
//   const withdrawalHistory = await WithdrawalRequest.findAll({
//     order: [["createdAt", "DESC"]], // Order by latest request first
//   });

//   if (!withdrawalHistory.length) {
//     return {
//       status: 404,
//       message: "No withdrawal history found.",
//     };
//   }

//   // Fetch all unique creator IDs from withdrawals
//     const creatorIds = [...new Set(withdrawalHistory.map(w => w.creatorId))];

//   // Fetch creator profiles for the creator IDs
//   const creatorProfiles = await CreatorProfile.find({
//     creatorId: { $in: creatorIds },
//   }).select("creatorId fullName");

//   // Map creator profiles by creatorId for quick access
//   const creatorMap = creatorProfiles.reduce((map, profile) => {
//     map[profile.creatorId] = profile.fullName;
//     return map;
//   }, {});

//   // Fetch balances for each creator from ecosystemTransaction
//   const balances = await Promise.all(
//     creatorIds.map(async (creatorId) => {
//       const transactions = await ecosystemTransaction.findAll({
//         where: { creatorId },
//       });
//       const balance = transactions.reduce(
//         (total, transaction) => total + parseFloat(transaction.amount || 0),
//         0
//       );
//       return { creatorId, balance };
//     })
//   );

//   // Map balances by creatorId for quick access
//   const balanceMap = balances.reduce((map, { creatorId, balance }) => {
//     map[creatorId] = parseFloat(balance).toFixed(2);
//     return map;
//   }, {});

//   // Map the most recent withdrawal history to the desired format
//   const response = Object.values(groupedWithdrawals).map((withdrawal) => {
//     const fullName = creatorMap[withdrawal.creatorId] || "N/A";
//     const balance = balanceMap[withdrawal.creatorId] || "0.00";

//     return {
//       withdrawalId: withdrawal.id, // Correct ID from the database
//       // creatorId: withdrawal.creatorId,
//       fullName,
//       ecosystemDomain: withdrawal.ecosystemDomain,
//       balance,
//       amount: withdrawal.amount,
//       status: withdrawal.status,
//       requestedAt: withdrawal.requestedAt,
//       processedAt: withdrawal.processedAt || "Pending",
//       balance,
//     };
//   });

//   return {
//     status: 200,
//     data: response,
//   };
// };

exports.getWithdrawalDetails = async () => {
  try {
    // Fetch all withdrawal requests ordered by latest first
    const withdrawalHistory = await WithdrawalRequest.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (!withdrawalHistory.length) {
      return {
        status: 404,
        message: "No withdrawal history found.",
      };
    }

    // Fetch all unique creator IDs from withdrawals
    const creatorIds = [...new Set(withdrawalHistory.map(w => w.creatorId))];

    // Fetch creator profiles for the creator IDs
    const creatorProfiles = await CreatorProfile.find({
      creatorId: { $in: creatorIds },
    }).select("creatorId fullName");

    // Map creator profiles by creatorId for quick access
    const creatorMap = creatorProfiles.reduce((map, profile) => {
      map[profile.creatorId] = profile.fullName;
      return map;
    }, {});

    // Fetch balances for each creator from ecosystemTransaction
    const balances = await Promise.all(
      creatorIds.map(async (creatorId) => {
        const transactions = await ecosystemTransaction.findAll({
          where: { creatorId },
        });
        const balance = transactions.reduce(
          (total, transaction) => total + parseFloat(transaction.amount || 0),
          0
        );
        return { creatorId, balance };
      })
    );

    // Map balances by creatorId for quick access
    const balanceMap = balances.reduce((map, { creatorId, balance }) => {
      map[creatorId] = parseFloat(balance).toFixed(2);
      return map;
    }, {});

    // Map all withdrawal requests
    const response = withdrawalHistory.map((withdrawal) => {
      const fullName = creatorMap[withdrawal.creatorId] || "N/A";
      const balance = balanceMap[withdrawal.creatorId] || "0.00";

      return {
        withdrawalId: withdrawal.id, 
        fullName,
        ecosystemDomain: withdrawal.ecosystemDomain,
        balance,
        amount: withdrawal.amount,
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt,
        processedAt: withdrawal.processedAt || "Pending",
      };
    });

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    console.error("Error fetching withdrawal details:", error);
    return { status: 500, data: { error: "Internal Server Error" } };
  }
};

exports.getWithdrawalDetailsForProfile = async (params) => {
  const { withdrawalId } = params;

  if (!withdrawalId) {
    return {
      status: 400,
      message: "Withdrawal ID is required.",
    };
  }

  // Fetch the specific withdrawal request by withdrawalId
  const specificWithdrawal = await WithdrawalRequest.findOne({
    where: { id: withdrawalId },
    include: [
      {
        model: Account,
        attributes: ["accountName", "accountNumber", "bankName"],
      },
      {
        model: Creator,
        attributes: ["id", "email"],
      },
    ],
  });

  if (!specificWithdrawal) {
    return {
      status: 404,
      message: "No withdrawal details found for the specified withdrawal ID.",
    };
  }

  const { creatorId, amount, status, requestedAt, adminId } = specificWithdrawal;
  console.log("specificWithdrawal:",creatorId)
  const { accountName, accountNumber, bankName } = specificWithdrawal.Account || {};
  const { email } = specificWithdrawal.Creator || {};

  // Fetch fullName from CreatorProfile using creatorId
  const creatorProfile = await CreatorProfile.findOne({creatorId});
  const fullName = creatorProfile?.fullName || "N/A";

  // Fetch the admin fullName if withdrawal is approved
  let approvedBy = "N/A";
  if (status === "approved" && adminId) {
    const admin = await AdminUser.findOne({ where: { id: adminId }, attributes: ["fullName"] });
  
    approvedBy = admin?.fullName || "N/A";
  }

  // Fetch all withdrawal requests for the creator
  const withdrawalHistory = await WithdrawalRequest.findAll({
    where: { creatorId },
    include: [{ model: Account, attributes: ["accountName", "accountNumber", "bankName"] }],
    order: [["requestedAt", "DESC"]],
  });

  // Fetch ecosystem data for the specific creator
  const ecosystem = await Ecosystem.findOne({ creatorId });

  // Fetch transactions to calculate incoming amount and wallet balance
  const transactions = await ecosystemTransaction.findAll({ where: { ecosystemDomain: ecosystem.ecosystemDomain } });
  console.log("this is transaction", transactions)
  const incomingAmount = transactions.reduce(
    (total, transaction) => total + parseFloat(transaction.amount || 0),
    0
  );

  console.log("this is incoming amount", incomingAmount)

  // Wallet balance
  const creatorBalance = await CreatorEarning.findOne({
    where: {
      ecosystemDomain: ecosystem.ecosystemDomain
    }
  })

  const nairaBalance = creatorBalance.Naira;
  const dollarBalance = creatorBalance.Dollar;

  // Calculate the outgoing amount (sum of withdrawal amounts for the creator)
  const outgoingAmount = withdrawalHistory.reduce(
    (total, withdrawal) => total + parseFloat(withdrawal.amount || 0),
    0
  );
  console.log("this is outgoing amount", outgoingAmount)

  // Map withdrawal history to the required format
  const historyResponse = withdrawalHistory.map((withdrawal) => {
    const { accountName, accountNumber, bankName } = withdrawal.Account || {};
    const withdrawalDate = withdrawal.requestedAt.toISOString().split("T")[0];
    const withdrawalTime = withdrawal.requestedAt.toISOString().split("T")[1].split(".")[0];

    return {
      withdrawalId: withdrawal.id,
      accountDetails: {
        accountName: accountName || "N/A",
        accountNumber: accountNumber || "N/A",
        bankName: bankName || "N/A",
      },
      ecosystemDomain: ecosystem?.ecosystemDomain || "N/A",
      amount: parseFloat(withdrawal.amount || 0).toFixed(2),
      status: withdrawal.status || "N/A",
      date: withdrawalDate,
      time: withdrawalTime,
    };
  });

  // Format the specific withdrawal response
  const specificWithdrawalDate = requestedAt.toISOString().split("T")[0];
  const specificWithdrawalTime = requestedAt.toISOString().split("T")[1].split(".")[0];

  return {
    status: 200,
    data: {
      specificWithdrawal: {
        withdrawalId: specificWithdrawal.id,
        creatorId,
        email: email || "N/A",
        fullName: fullName,
        phoneNumber: creatorProfile?.phoneNumber || "N/A",
        accountDetails: {
          accountName: accountName || "N/A",
          accountNumber: accountNumber || "N/A",
          bankName: bankName || "N/A",
        },
        ecosystemDomain: ecosystem?.ecosystemDomain || "N/A",
        amount: parseFloat(amount || 0).toFixed(2),
        status: status || "N/A",
        date: specificWithdrawalDate,
        time: specificWithdrawalTime,
        approvedBy: approvedBy,
        country: ecosystem?.country || "N/A",
        state: ecosystem?.state || "N/A",
        localgovernment: ecosystem?.localgovernment || "N/A",
        location: ecosystem?.address || "N/A",
      },
      withdrawalHistory: historyResponse,
      incomingAmount: parseFloat(incomingAmount).toFixed(2),
      outgoingAmount: parseFloat(outgoingAmount).toFixed(2),
       nairaBalance: parseFloat(nairaBalance).toFixed(2),
       dollarBalance: parseFloat(dollarBalance).toFixed(2),
    },
  };
};


exports.transactionDetails = async () => {
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

// get user(merchant and enduser information)
exports.endUserTransaction = async () => {

  const creators = await Creator.findAll();

  const creatorProfiles = await CreatorProfile.find({});

  const ecosystems = await Ecosystem.find({});

  const withdrawals = await WithdrawalRequest.findAll();

   const transactions = await ecosystemTransaction.findAll({
  include: [
    {
      model: EcosystemUser,
      attributes: ["username"], 
    },
  ],
});

// Format the response to include fullName directly
const endUserDetails = transactions.map((transaction) => ({
  ...transaction.toJSON(),
  userName: transaction.User?.username || null, 
}));


  // Map creator details along with their withdrawals and ecosystem domain
  const creatorDetails = await Promise.all(
    creators.map(async (creator) => {
      const creatorProfile = creatorProfiles.find(
        (profile) => profile.creatorId === creator.id.toString()
      );

      const ecosystem = ecosystems.find((eco) => eco.creatorId === creator.id);

      const creatorWithdrawals = withdrawals.filter(
        (withdrawal) => withdrawal.creatorId === creator.id
      );

      // Sum all withdrawal amounts
      const totalAmountWithdrawn = creatorWithdrawals.reduce((sum, withdrawal) => {
          return sum + parseFloat(withdrawal.amount);
      }, 0);

      const earnings = await CreatorEarning.findOne({
        where: {
          creatorId: creator.id
        }
      })

      return {
        id: creator.id, // Include creator ID
        creatorName: creatorProfile?.fullName || creator.organizationName,
        ecosystemDomain: ecosystem ? ecosystem.ecosystemDomain : "N/A",
        balance: earnings,
        date: creator.createdAt.toISOString().split("T")[0],
        time: creator.createdAt.toISOString().split("T")[1].split(".")[0],
        status: creator.step === 5 ? "Completed" : "In progress",
        withdrawals: totalAmountWithdrawn
      };
    })
  );

  // Sort creator details in descending order
  const sortedCreatorDetails = creatorDetails.sort((a, b) => b.id - a.id);

  return {
    status: 200,
    data: {
      creatorAccount: sortedCreatorDetails,
      endUser: endUserDetails,
    },
  };
};
