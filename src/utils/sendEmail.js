const nodemailer = require("nodemailer");
const nodeMailerConfig = require("../config/nodeMailer");

const sendEmail = async ({ html, to, subject, }) => {
  const transporter = nodemailer.createTransport(nodeMailerConfig);

  try {
    const info = await transporter.sendMail({
      from: `"Dimpified" <migration@gfa-tech.com>`,
      html,
      to,
      subject,
    });
    return info;
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;
