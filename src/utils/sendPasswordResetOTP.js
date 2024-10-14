const sendEmail = require("./sendEmail");

const sendForgotPasswordOTP = async ({ username, email, OTP }) => {
  const message = `<p>Your One-Time Password (OTP) for resetting your password is: 
  <strong>${OTP}</strong></p>
  <p>Please use this OTP to complete the password reset process. The OTP is valid for a limited time.</p>`;

  return sendEmail({
    to: email,
    subject: "Dimpified Password Reset",
    html: `<h4>Hello, ${username}</h4>
    ${message}
    `,
  });
};

module.exports = sendForgotPasswordOTP;
