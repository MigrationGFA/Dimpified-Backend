const authService = require('../../../../services/creatorAuthServices');

exports.creatorSignup = async (req, res) => {
  try {
    const response = await authService.creatorSignup(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};




