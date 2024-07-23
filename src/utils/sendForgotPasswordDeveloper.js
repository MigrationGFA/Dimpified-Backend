const sendEmail = require("./sendEmail");

const sendForgotPasswordEmailDeveloper = async ({
  fullName,
  email,
  token,
  origin,
}) => {
  const resetURL = `${origin}/creator/reset-password?token=${token}&email=${email}`;

  const message = `<p>Please reset your password by clicking on the following link: 
    <a href="${resetURL}">Reset Password</a></p>`;

  return sendEmail({
    to: email,
    subject: "Dimpified Reset Password",
    html: `<h4>Hello, ${fullName}</h4>
      ${message}`,
  });
};

module.exports = sendForgotPasswordEmailDeveloper;
