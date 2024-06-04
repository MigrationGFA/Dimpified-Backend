const sendEmail = require("./sendEmail");

const sendCreatorResetPasswordAlert = async ({
  organizationName,
  email,
  origin,
}) => {
  const supportURL = `${origin}/support`;

  const message = `<p>Your password has been successfully changed. If you did not initiate this step, click on the following link to contact support and secure your account: 
    <a href="${supportURL}">Contact Support</a></p>`;

  return sendEmail({
    to: email,
    subject: "Dimpified Creator Reset Password Alert",
    html: `<h4>Hello, ${organizationName}</h4>
      ${message}
      `,
  });
};

module.exports = sendCreatorResetPasswordAlert;
