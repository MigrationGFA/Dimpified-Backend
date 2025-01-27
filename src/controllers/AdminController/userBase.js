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


exports.getStoreByCountryState = async (req, res) => {
  try {
    const response = await adminUserBase.getStoreByCountryState(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all store by country for state", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getStoreByLocation = async (req, res) => {
  try {
    const response = await adminUserBase.getStoreByLocation(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all store by location", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getStoreByLocalGovernment = async (req, res) => {
  try {
    const response = await adminUserBase.getStoreByLocalGovernment(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting all store by country for state and local government", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};