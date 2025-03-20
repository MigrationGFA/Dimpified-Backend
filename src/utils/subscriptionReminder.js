const sendEmail = require("./sendEmail");

const sendSubscriptionReminder = async ({
  day,
      email,
      organizationName,
      websiteUrl,
      plan,
      amount,
      formattedDate
  
}) => {
      const date = new Date(formattedDate).toLocaleDateString();
  const message = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>{{Thank You for Purchasing Our Course!}}</title>
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
    </style>
</head>

<body>
    <div
        style="background-color:#f8f8f8; line-height: 1.5; min-height: 100%; font-weight: normal; font-size: 15px; color: #2F3044; margin:0; padding:20px;">
        <div
            style="background-color:#ffffff; padding: 45px 0 34px 0; border-radius: 24px; margin:40px auto; max-width: 600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" height="auto"
                style="border-collapse:collapse">
                <tbody>
                    <tr style="display: flex; justify-content: center; margin:0 25px 35px 25px">
                        <td align="center" valign="center" style="text-align:left; padding-bottom: 10px">

                            <div>
                                <!--begin:Logo-->
                                <div style="text-align:center; margin-bottom: 40px">
                                    <a rel="noopener">
                                        <img alt="Dimpified Logo" src="https://res.cloudinary.com/diz6tdgeo/image/upload/v1725638667/dimp_rwgeri.png" style="height: 60px" />
                                    </a>
                                </div>
                                <!--end:Logo-->

                                <!--begin:Text-->
                                <div
                                    style="font-size: 15px; font-weight: normal; margin-bottom: 27px; line-height: 30px">
                                    <p style="margin-bottom:2px; color:#333; font-weight: 600">Hello ${organizationName},!</h2>
                                    <p>We wish to inform you that your Merchant/Business page on Dimpified
          will expire in less than <strong>${day}</strong></p>
                                    <p style="margin-bottom: 2px; color: #333">
                                        Below is the website details.
                                    </p>
                                    <p style="margin-bottom: 2px; color: #333">
                                      <strong>Website URL:</strong> ${websiteUrl} <br>
      <strong>Current Plan:</strong> ${plan} <br>
      <strong>Amount to pay:</strong> ${amount} <br>
      <strong>Expired Date:</strong> ${date} <br>
                                    </p>

                                    <p style="margin-bottom:2px; color:#333"> Please Note that if you are on a free plan, your business page will be
          shut down after ${day} until you move to a paid plan.</p>
           <div
          style="
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          "
        >
          <a
            href="https://dimpified.com/auth/login?subscription"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              style="
                width: 249px;
                height: 55px;
                background-color: black;
                border-radius: 10px;
                font-size: 24px;
                border: none;
                color: white;
                margin-top: 30px;
                cursor: pointer;
              "
            >
              Update Subscription
            </button>
          </a>
        </div>
                                    <p style="margin-bottom:2px; color:#333">Thank you once again for choosing Dimpified to bring your Business Online</p>
                                    <p style="margin-bottom:2px; color:#333">Should you have any questions or require
                                        further assistance, please do not hesitate to contact our dedicated support team
                                        at <a href="mailto:support@dimpified.com"
                                            style="text-decoration: none">support@dimpified.com</a>.</p>
                                </div>
                                <!--end:Text-->

                                <div
                                    style="font-size: 15px; font-weight: normal; line-height: 30px; margin: 40px 0px 0px 0px">
                                    <p style="color:#333;">Warm regards,<br>The Dimpified Team</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr
                        style="display: flex; justify-content: center; margin:0 25px 35px 25px; border-top: 1px solid #e7e9ed;">
                        <td align="center" valign="center"
                            style="font-size: 13px; text-align:left; padding: 10px 0 0 0; font-weight: 500; color: #7E8299">
                            <p style="margin-bottom:2px"> &copy; 2025 Dimpified. All rights Reserved.</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <!--end::Email template-->
</body>

</html>

`;

  return sendEmail({
    to: email,
    subject: "Subscription Reminder",
    html: `<h4>Subscription Reminder</h4>
    ${message}
    `,
  });
};

module.exports = sendSubscriptionReminder;
