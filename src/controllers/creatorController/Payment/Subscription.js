const paymentServices = require("../../../services/paymentServices")


exports.verifySubscription = async (req, res) => {
  try {
    const response = await paymentServices.verifySubscription(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying subscribtion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





exports.createLiteSubscribtion = async (req, res) => {
  try {
    const response = await paymentServices.createLiteSubscribtion(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying subscribtion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.updateSubscription = async (req, res) => {
  try {
    const response = await paymentServices.updateSubscription(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying subscribtion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.comfirmSubscription = async (req, res) => {
  try {
    const response = await paymentServices.comfirmSubscription(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying subscribtion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


