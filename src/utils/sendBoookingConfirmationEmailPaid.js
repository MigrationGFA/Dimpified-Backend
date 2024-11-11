const sendEmail = require("./sendEmail");

const sendBookingConfirmationPaidEmail = async ({
  email,
  name,
  bookingId,
  service,
  bookingType,
  date,
  time,
  paymentStatus,
  businessName,
  businessAddress,
  logo,
}) => {
  const formattedDate = new Date(date).toLocaleDateString();

  const message = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Booking Confirmation - Payment Confirmed</title>
  <style>
    @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");

    html,
    body {
      padding: 0;
      margin: 0;
      font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
      -webkit-text-size-adjust: none;
    }

    a:hover {
      color: #009ef7;
    }

    .container {
      background-color: #f8f8f8;
      line-height: 1.5;
      min-height: 100%;
      font-weight: normal;
      font-size: 15px;
      color: #2f3044;
      margin: 0;
      padding: 20px;
    }

    .email-wrapper {
      background-color: #ffffff;
      padding: 45px 0 34px 0;
      border-radius: 24px;
      margin: 40px auto;
      max-width: 600px;
    }

    .header img {
      height: 60px;
    }

    .section-content {
      font-size: 15px;
      font-weight: normal;
      margin-bottom: 27px;
      line-height: 30px;
      color: #333;
    }

    .section-content p {
      margin-bottom: 2px;
    }

    .section-content strong {
      color: #4033f5;
    }

    .footer-content {
      font-size: 13px;
      text-align: left;
      padding: 10px 0 0 0;
      font-weight: 500;
      color: #7e8299;
    }

    .button {
      display: inline-block;
      padding: 10px 20px;
      font-size: 18px;
      color: #ffffff;
      background-color: #4033f5;
      border-radius: 8px;
      text-decoration: none;
      margin-top: 20px;
      text-align: center;
    }

    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }

      .email-wrapper {
        padding: 20px 0 15px 0;
      }

      .section-content {
        font-size: 16px;
      }

      .footer-content {
        font-size: 12px;
      }
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="email-wrapper">
      <table
        align="center"
        border="0"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        style="border-collapse: collapse"
      >
        <tbody>
          <tr>
            <td align="center" valign="center" style="text-align: center; padding-bottom: 10px;">
              <div class="header">
                <a href="#" rel="noopener">
                  <img
                    alt="${businessName} Logo"
                    src="${logo}"
                  />
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td align="left" valign="top" style="padding: 0 25px;">
              <div class="section-content">
                <p>Dear ${name},</p>
                <p>Congratulations ${businessName}! You have received a new booking order from a client. Here are the details:</p>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Booking Type:</strong> ${bookingType}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Payment Status:</strong> ${paymentStatus}</p>
                <p>Please review the details and reach out to the client if you need any further information. Best of luck with your upcoming booking!</p>
                <p>Thank you for using DIMP to set up your business online, and best of luck with your new booking!</p>
                <p>Best regards,</p>
                <p><em>The ${businessName} Team</em></p>
              </div>
            </td>
          </tr>
          <tr>
            <td align="left" valign="center" style="border-top: 1px solid #e7e9ed; padding: 20px 25px 0 25px;">
              <div class="footer-content">
                <p>Thank you for choosing ${businessName}</p>
                <p>&copy; 2024 ${businessName}. All rights Reserved.</p>
                <p>${businessAddress}</p>
                <p>
                  <a href="#" style="color: #007BFF; text-decoration: none;">Privacy Policy</a> | 
                  <a href="#" style="color: #007BFF; text-decoration: none;">Terms of Service</a>
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

  await sendEmail({
    to: email,
    subject: "Booking Confirmation - Payment confirmed",
    html: message,
  });
};

module.exports = sendBookingConfirmationPaidEmail;
