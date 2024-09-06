const sendEmail = require("./sendEmail");

const sendWithdrawalRequestEmail = async ({
  organizationName,
  email,
  amount,
  currency,
}) => {
  const message = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Withdrawal Request Notification</title>
    <style>
      @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");

      html, body {
        padding: 0;
        margin: 0;
        font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
        -webkit-text-size-adjust: none;
      }

      a:hover {
        color: #009ef7;
      }
    </style>
  </head>
  <body>
    <div
      style="
        background-color: #f8f8f8;
        line-height: 1.5;
        min-height: 100%;
        font-weight: normal;
        font-size: 15px;
        color: #2f3044;
        margin: 0;
        padding: 20px;
      "
    >
      <div
        style="
          background-color: #ffffff;
          padding: 45px 0 34px 0;
          border-radius: 24px;
          margin: 40px auto;
          max-width: 600px;
        "
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          height="auto"
          style="border-collapse: collapse"
        >
          <tbody>
            <tr
              style="
                display: flex;
                justify-content: center;
                margin: 0 25px 35px 25px;
              "
            >
              <td
                align="center"
                valign="center"
                style="text-align: left; padding-bottom: 10px"
              >
                <div>
                  <!--begin:Logo-->
                  <div style="text-align: center; margin-bottom: 40px">
                    <a rel="noopener">
                      <img
                        alt="Dimpified Logo"
                        src="https://res.cloudinary.com/diz6tdgeo/image/upload/v1725638667/dimp_rwgeri.png"
                        style="height: 60px"
                      />
                    </a>
                  </div>
                  <div
                    style="
                      font-size: 15px;
                      font-weight: normal;
                      margin-bottom: 27px;
                      line-height: 30px;
                    "
                  >
                    <p
                      style="margin-bottom: 2px; color: #333; font-weight: 600"
                    >
                      Dear ${organizationName},
                    </p>
                    <p style="margin-bottom: 2px; color: #333">
                      We wanted to inform you that a withdrawal request has been initiated from your account.
                      <br />
                      Here are the details:
                    </p>
                    <p style="margin-bottom: 2px; color: #333">
                      Withdrawal Amount: ${amount} ${currency}<br />
                    </p>
                    <p>
                      If you initiated this withdrawal request, there is no further action required from your end. However, if you did not authorize this withdrawal or have any concerns regarding it, please reach out to our support team immediately at
                      <a
                        href="mailto:support@dimpified.com"
                        style="text-decoration: none; color: #009ef7"
                      >support</a
                      >. We take the security of your account very seriously and will assist you in resolving any issues promptly.
                    </p>

                    <p>
                      <strong>Note</strong> <br />
                      You will receive your money in your bank account after two business working days of making the withdrawal request.
                    </p>
                  </div>

                  <div
                    style="
                      font-size: 15px;
                      font-weight: normal;
                      line-height: 30px;
                      margin: 40px 0px 0px 0px;
                    "
                  >
                    <p style="color: #333">
                      Warm regards,<br />The Dimpified Team
                    </p>
                  </div>
                </div>
              </td>
            </tr>
            <tr
              style="
                display: flex;
                justify-content: center;
                margin: 0 25px 35px 25px;
                border-top: 1px solid #e7e9ed;
              "
            >
              <td
                align="center"
                valign="center"
                style="
                  font-size: 13px;
                  text-align: left;
                  padding: 10px 0 0 0;
                  font-weight: 500;
                  color: #7e8299;
                "
              >
                <p style="margin-bottom: 2px">
                  Thank you for choosing Dimpified for your financial needs.
                </p>
                <p style="margin-bottom: 2px">
                  &copy; 2024 Dimpified. All rights Reserved.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>
`;

  return sendEmail({
    to: email,
    subject: "Withdrawal Request Notification",
    html:  `<h4> Hello, ${organizationName}</h4>
    ${message}
    `,
  });
};

module.exports = sendWithdrawalRequestEmail;
