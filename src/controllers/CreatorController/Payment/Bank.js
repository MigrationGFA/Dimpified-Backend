const creatorBankAccount = require("../../../services/creatorBankAccount");
// exports.getAllBanks = async (req, res) => {
//     try {
//         const response = await creatorBankAccount.getAllBanks();
//         return res.status(response.status).json(response.data)
//     } catch (error) {
//         console.error("Error getting all banks:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// }

exports.getAllBanks = async (req, res) => {
  try {
    const response = await creatorBankAccount.getAllBanks();
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting all banks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyBankDetails = async (req, res) => {
  try {
    const response = await creatorBankAccount.verifyBankDetails(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying banks details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getCreatorBankDetails = async (req, res) => {
  try {
    const response = await creatorBankAccount.getCreatorBankDetails(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting creator banks details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.saveCreatorAccount = async (req, res) => {
  try {
    const response = await creatorBankAccount.saveCreatorAccount(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error saving creator banks details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
