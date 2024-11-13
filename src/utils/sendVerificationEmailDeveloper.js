const sendEmail = require("./sendEmail");

const sendVerificationEmailDeveloper = async ({
  fullName,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmailUrl = `${origin}/developer/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<p>Please confirm your email by clicking on the following link: 
    <a href="${verifyEmailUrl}">Verify Email</a></p>`;
  return sendEmail({
    to: email,
    subject: "Dimpified Email Confirmation",
    html: `<h4>Hello, ${fullName}</h4>
      ${message}`,
  });
};

module.exports = sendVerificationEmailDeveloper;
