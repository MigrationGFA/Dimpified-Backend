const authServices = require("../../../services/affiliateServices/authServices");

exports.affiliateSignup = async (req, res) => {
    try {
        const response = await authServices.affiliateSignup(req.body)
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error signingup affiliate:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.resendEmailAffiliate = async (req, res) => {
    try {
        const response = await authServices.resendEmailAffiliate(req.body);
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error resending affiliate email:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.resetPasswordAffiliate = async (req, res) => {
    try {
        const response = await authServices.resetPasswordAffiliate(req.body);
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error resetting affiliate password:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.verifyEmailAffiliate = async (req, res) => {
    try {
        const response = await authServices.verifyEmailAffiliate(req.body);
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error sending affiliate verify email:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.affiliateLogin = async (req, res) => {
    try {
        const response = await authServices.affiliateLogin(req.body, req.headers)
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error logging your affiliate profile:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.forgotPasswordAffiliate = async (req, res) => {
    try {
        const response = await authServices.forgotPasswordAffiliate(req.body)
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error  getting affiliate forgot password:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}