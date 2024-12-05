const {
  getAllEcosystemTransactions,
} = require("../../controllers/AdminController/procedure");

const CreatorProfile = require("../../models/CreatorProfile");
const WithdrawalRequest = require("../../models/withdrawalRequest");
const Account = require("../../models/Account");
const Creator = require("../../models/Creator");

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
  console.log("Starting to fetch withdrawal details...");

  // Step 1: Fetch all withdrawal requests
  const withdrawalDetails = await WithdrawalRequest.findAll({
    include: [
      {
        model: Account,
        attributes: [
          "ecosystemDomain",
          "accountName",
          "accountNumber",
          "bankName",
          "currency",
        ],
      },
      {
        model: Creator,
        attributes: ["id"], // Fetch creator IDs to ensure they're valid
      },
    ],
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

  console.log("Withdrawal Requests Found:", withdrawalDetails);

  if (!withdrawalDetails.length) {
    console.log("No withdrawal requests found.");
    return { status: 200, data: [], message: "No withdrawal requests found." };
  }

  // Step 2: Get creator IDs from withdrawal requests
  const creatorIds = withdrawalDetails.map((request) => request.creatorId);
  console.log("Creator IDs from WithdrawalRequest:", creatorIds);

  // Step 3: Fetch CreatorProfiles for the given creator IDs
  const creatorProfiles = await CreatorProfile.find({
    creatorId: { $in: creatorIds },
  })
    .select("creatorId fullName")
    .lean();

  console.log("CreatorProfiles Found:", creatorProfiles);

  // Step 4: Map CreatorProfiles by creatorId for quick lookup
  const profileMap = creatorProfiles.reduce((acc, profile) => {
    acc[profile.creatorId] = profile.fullName;
    return acc;
  }, {});

  console.log("Mapped CreatorProfiles:", profileMap);

  // Step 5: Format the data
  const formattedData = withdrawalDetails.map((request) => {
    const { amount, status, requestedAt, processedAt, creatorId } = request;
    const fullName = profileMap[creatorId] || "Unknown Creator";
    const ecosystemDomain = request.Account
      ? request.Account.ecosystemDomain
      : "Unknown";

    // Extract date and time from requestedAt
    const date = requestedAt.toISOString().split("T")[0];
    const time = requestedAt.toISOString().split("T")[1].split(".")[0];

    console.log(
      `Processed Creator ID: ${creatorId}, Full Name: ${fullName}, Ecosystem Domain: ${ecosystemDomain}`
    );

    return {
      creatorId,
      creatorFullName: fullName,
      ecosystemDomain,
      amountWithdrawn: amount,
      date,
      time,
      status,
    };
  });

  console.log("Formatted Withdrawal Data:", formattedData);

  return { status: 200, data: formattedData };
};
