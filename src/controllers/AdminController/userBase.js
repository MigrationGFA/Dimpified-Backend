const adminUserBase = require("../../services/adminServices/userBase")

exports.getStoreByCountry = async (req, res) => {
  try {
    const response = await adminUserBase.getStoreByCountry();
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all store by country", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getStoreByDate = async (req, res) => {
  try {
    const response = await adminUserBase.getStoreByDate(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all store by date", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};