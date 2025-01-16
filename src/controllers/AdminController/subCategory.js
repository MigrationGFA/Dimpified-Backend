const adminSubCategory = require("../../services/adminServices/SubCategory")

exports.getASubcategory = async (req, res) => {
  try {
    const response = await adminSubCategory.getASubcategory(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error getting a sub category", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};