const sendEmail = require("./sendEmail");

const sendForgotPasswordEmailAffiliate = async ({
  userName,
  email,
  token,
  origin,
}) => {
  const resetPasswordUrl = `${origin}/affiliate/reset-password?token=${token}&email=${email}`;

  const message = `<p>Please reset your password by clicking on the following link: 
    <a href="${resetPasswordUrl}">Reset Password</a></p>`;

  return sendEmail({
    to: email,
    subject: "Reset Your Dimpified Affiliate Password",
    html: `<h4>Hello, ${userName}</h4>
      ${message}`,
  });
};

module.exports = sendForgotPasswordEmailAffiliate;
