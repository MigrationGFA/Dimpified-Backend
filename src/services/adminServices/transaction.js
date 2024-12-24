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
  // Fetch all withdrawal requests
  const withdrawalHistory = await WithdrawalRequest.findAll({
    order: [["createdAt", "DESC"]], // Order by latest request first
  });

  if (!withdrawalHistory.length) {
    return {
      status: 404,
      message: "No withdrawal history found.",
    };
  }

  // Group by creatorId and keep only the first (most recent) withdrawal for each creator
  const groupedWithdrawals = withdrawalHistory.reduce((map, withdrawal) => {
    if (!map[withdrawal.creatorId]) {
      map[withdrawal.creatorId] = withdrawal;
    }
    return map;
  }, {});

  // Fetch unique creator IDs
  const creatorIds = Object.keys(groupedWithdrawals);

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

  // Map the most recent withdrawal history to the desired format
  const response = Object.values(groupedWithdrawals).map((withdrawal) => {
    const fullName = creatorMap[withdrawal.creatorId] || "N/A";
    const balance = balanceMap[withdrawal.creatorId] || "0.00";

    return {
      withdrawalId: withdrawal.id, // Correct ID from the database
      // creatorId: withdrawal.creatorId,
      fullName,
      ecosystemDomain: withdrawal.ecosystemDomain,
      balance,
      amount: withdrawal.amount,
      status: withdrawal.status,
      requestedAt: withdrawal.requestedAt,
      processedAt: withdrawal.processedAt || "Pending",
      balance,
    };
  });

  return {
    status: 200,
    data: response,
  };
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

  const { creatorId, amount, status, requestedAt } = specificWithdrawal;
  const { accountName, accountNumber, bankName } =
    specificWithdrawal.Account || {};
  const { email } = specificWithdrawal.Creator || {};

  // Fetch fullName from CreatorProfile using creatorId
  const creatorProfile = await CreatorProfile.findOne({ creatorId }).exec();
  const fullName = creatorProfile?.fullName || "N/A";

  // Fetch all withdrawal requests for the creator
  const withdrawalHistory = await WithdrawalRequest.findAll({
    where: { creatorId },
    include: [
      {
        model: Account,
        attributes: ["accountName", "accountNumber", "bankName"],
      },
    ],
    order: [["requestedAt", "DESC"]],
  });

  // Fetch ecosystem data for the specific creator
  const ecosystem = await Ecosystem.findOne({ creatorId }).select(
    "ecosystemDomain"
  );

  // Fetch transactions to calculate incoming amount and wallet balance
  const transactions = await ecosystemTransaction.findAll({
    where: { creatorId },
  });

  const incomingAmount = transactions.reduce(
    (total, transaction) => total + parseFloat(transaction.amount || 0),
    0
  );

  // Wallet balance (total amount from ecosystemTransaction)
  const walletBalance = incomingAmount;

  // Calculate the outgoing amount (sum of withdrawal amounts for the creator)
  const outgoingAmount = withdrawalHistory.reduce(
    (total, withdrawal) => total + parseFloat(withdrawal.amount || 0),
    0
  );

  // Map withdrawal history to the required format
  const historyResponse = withdrawalHistory.map((withdrawal) => {
    const { accountName, accountNumber, bankName } = withdrawal.Account || {};
    const withdrawalDate = withdrawal.requestedAt.toISOString().split("T")[0];
    const withdrawalTime = withdrawal.requestedAt
      .toISOString()
      .split("T")[1]
      .split(".")[0];

    return {
      withdrawalId: withdrawal.id,
      accountDetails: {
        accountName: accountName || "N/A",
        accountNumber: accountNumber || "N/A",
        bankName: bankName || "N/A",
      },
      ecosystemDomain: ecosystem?.ecosystemDomain || "N/A",
      amount: parseFloat(withdrawal.amount || 0).toFixed(2), // Requested amount
      status: withdrawal.status || "N/A",
      date: withdrawalDate,
      time: withdrawalTime,
    };
  });

  // Format the specific withdrawal response
  const specificWithdrawalDate = requestedAt.toISOString().split("T")[0];
  const specificWithdrawalTime = requestedAt
    .toISOString()
    .split("T")[1]
    .split(".")[0];

  return {
    status: 200,
    data: {
      specificWithdrawal: {
        withdrawalId: specificWithdrawal.id,
        creatorId,
        email: email || "N/A",
        fullName: fullName,
        accountDetails: {
          accountName: accountName || "N/A",
          accountNumber: accountNumber || "N/A",
          bankName: bankName || "N/A",
        },
        ecosystemDomain: ecosystem?.ecosystemDomain || "N/A",
        amount: parseFloat(amount || 0).toFixed(2),
        // status: status || "N/A",
        // date: specificWithdrawalDate,
        // time: specificWithdrawalTime,
      },
      withdrawalHistory: historyResponse,
      incomingAmount: parseFloat(incomingAmount).toFixed(2),
      outgoingAmount: parseFloat(outgoingAmount).toFixed(2),
      walletBalance: parseFloat(walletBalance).toFixed(2),
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

exports.endUserTransaction = async () => {
  // Fetch all bookings
  const bookings = await Booking.find({});

  // Fetch all creators
  const creators = await Creator.findAll();

  // Fetch all creator profiles
  const creatorProfiles = await CreatorProfile.find({});

  // Fetch all ecosystems
  const ecosystems = await Ecosystem.find({});

  // Fetch all withdrawal requests
  const withdrawals = await WithdrawalRequest.findAll();

  // Map end user details directly from bookings and assign sequential IDs
  const endUserDetails = bookings
    .map((booking, index) => ({
      id: bookings.length - index, // Assign sequential ID in descending order
      userName: booking.name,
      ecosystemDomain: booking.ecosystemDomain,
      service: booking.service,
      amountPaid: parseFloat(booking.price || 0).toFixed(2),
      date: booking.date.toISOString().split("T")[0],
      time: booking.time,
      status: booking.status,
    }))
    .sort((a, b) => b.id - a.id); // Sort in descending order by ID

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

      return {
        id: creator.id, // Include creator ID
        creatorName: creatorProfile?.fullName || creator.organizationName,
        ecosystemDomain: ecosystem ? ecosystem.ecosystemDomain : "N/A",
        balance: parseFloat(creator.balance || 0).toFixed(2),
        date: creator.createdAt.toISOString().split("T")[0],
        time: creator.createdAt.toISOString().split("T")[1].split(".")[0],
        status: creator.step === 5 ? "Completed" : "In progress",
        withdrawals: creatorWithdrawals.map((withdrawal) => ({
          amountWithdrawn: parseFloat(withdrawal.amount),
        })),
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
