const sendEmail = require("./sendEmail");

const sendVerificationEmailUser = async ({
  username,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmailUrl = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;

  const message = `<p>Please confirm your email by clicking on the following link: 
    <a href="${verifyEmailUrl}">Verify Email</a></p>`;

  return sendEmail({
    to: email,
    subject: "Dimpified Email Confirmation",
    html: `<h4>Hello, ${username}</h4>
      ${message}`,
  });
};

module.exports = sendVerificationEmailUser;
