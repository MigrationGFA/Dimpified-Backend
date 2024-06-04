const sendEmail = require("./sendEmail");

const sendForgotPasswordEmailUser = async ({
  username,
  email,
  token,
  origin,
}) => {
  const resetURL = `${origin}/user/reset-password?token=${token}&email=${email}`;

  const message = `<p>Please reset your password by clicking on the following link: 
    <a href="${resetURL}">Reset Password</a></p>`;

  return sendEmail({
    to: email,
    subject: "Dimpified Reset Password",
    html: `<h4>Hello, ${username}</h4>
      ${message}`,
  });
};

module.exports = sendForgotPasswordEmailUser;
