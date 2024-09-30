const sendEmail = require("./sendEmail");

const sendVerificationOTPCreator = async ({
  organizationName,
  email,
  origin,
  verificationToken,
}) => {
  const message = `
    <table
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      style="font-family: Arial, sans-serif"
    >
      <tr>
        <td align="center" style="padding: 20px 0; background-color: #f8f8f8">
          <img
            alt="Dimpified Logo"
            src="https://res.cloudinary.com/diz6tdgeo/image/upload/v1725638667/dimp_rwgeri.png"
            style="display: block; margin: 0 auto; height: 100px"
          />
        </td>
      </tr>
      <tr>
        <td align="center" style="background-color: #f8f8f8; padding: 30px">
          <table
            width="600"
            border="0"
            cellpadding="0"
            cellspacing="0"
            style="
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            "
          >
            <tr>
              <td
                align="center"
                style="
                  padding: 40px;
                  font-size: 20px;
                  font-weight: bold;
                  color: #1e2239;
                "
              >
                Please verify your email
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style="padding: 0 40px 40px; color: #333333; font-size: 16px"
              >
                <p><strong>Hello ${organizationName},</strong></p>
                <p>
                  To verify your email on Dimpified, please confirm your email
                  by entering the OTP code below.
                </p>
                <h3>${verificationToken}</h3> <!-- Display the OTP code here -->
              </td>
            </tr>
            <tr>
              <td align="center" style="font-size: 16px; padding: 0 40px 40px">
                <p>If you did not request this email, please ignore it.</p>
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style="padding: 10px 20px 20px; font-size: 14px; color: #999999"
              >
                <p>&copy; Dimpified | All Rights Reserved</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
`;

  return sendEmail({
    to: email,
    subject: "Dimpified Email Confirmation",
    html: `<h4>Hello, ${organizationName}</h4>
      ${message}`,
  });
};

module.exports = sendVerificationOTPCreator;
