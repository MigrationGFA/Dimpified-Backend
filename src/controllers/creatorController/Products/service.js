const ecosystemProduct = require("../../../services/ecosystemProducts")

exports.createService = async (req, res) => {
  try {
    const response = await ecosystemProduct.createService(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getAllServices = async (req, res) => {
  try {
    const response = await ecosystemProduct.getAllServices(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.editServiceDetailsAndAddService = async (req, res) => {
  try {
    const response = await ecosystemProduct.editServiceDetailsAndAddService(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.editSubService = async (req, res) => {
  try {
    const response = await ecosystemProduct.editSubService(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



