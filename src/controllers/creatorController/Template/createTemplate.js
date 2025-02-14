const ecosystemTemplate = require("../../../services/ecosytem")

exports.createNewTemplate = async (req, res) => {
  try {
    const response = await ecosystemTemplate.createNewTemplate(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.createReservedTemplate = async (req, res) => {
  try {
    const response = await ecosystemTemplate.createReservedTemplate(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAnEcosystemTemplate = async (req, res) => {
  try {
    const response = await ecosystemTemplate.getAnEcosystemTemplate(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting template:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getReservedTemplate = async (req, res) => {
  try {
    const response = await ecosystemTemplate.getReservedTemplate(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error getting template:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.editCreatorTemplate = async (req, res) => {
  try {
    const response = await ecosystemTemplate.editCreatorTemplate(req.params, req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error editing template", error);
    res.status(500).json({ message: "Server error", error: error.message })
  }
}