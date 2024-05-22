const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
  organizationName,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<p>Please confirm your email by clicking on the following link : 
  <a href="${verifyEmail}">Verify Email</a> </p>`;

  return sendEmail({
    to: email,
    subject: "Dimpified Email Confirmation",
    html: `<h4> Hello, ${organizationName}</h4>
    ${message}
    `,
  });
};

module.exports = sendVerificationEmail;
