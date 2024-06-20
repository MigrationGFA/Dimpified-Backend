const sendEmail = require("./sendEmail");



const sendContactUsFeedbackEmail = async ({
    //requestId,
    username,
    subject,
    //organizationName,
    email,
    reason,
    message
}) => {


    const messageContent = `
      <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>{{Help Request Feedback}}</title>
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
    <div style="
        background-color: #f8f8f8;
        line-height: 1.5;
        min-height: 100%;
        font-weight: normal;
        font-size: 15px;
        color: #2f3044;
        margin: 0;
        padding: 20px;
      ">
        <div style="
          background-color: #ffffff;
          padding: 45px 0 34px 0;
          border-radius: 24px;
          margin: 40px auto;
          max-width: 600px;
        ">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" height="auto"
                style="border-collapse: collapse">
                <tbody>
                    <tr style="
                display: flex;
                justify-content: center;
                margin: 0 25px 35px 25px;
              ">
                        <td align="center" valign="center" style="text-align: left; padding-bottom: 10px">
                            <div>
                                <!--begin:Logo-->
                                <div style="text-align: center; margin-bottom: 40px">
                                    <a rel="noopener">
                                        <img alt="Unleashified Logo"
                                            src="https://res.cloudinary.com/djhnaee9k/image/upload/v1714038296/et5gicqtnuw4u1tqujjr.png"
                                            style="height: 60px" />
                                    </a>
                                </div>
                                <!--end:Logo-->

                                <!--begin:Text-->
                                <div style="
                      font-size: 15px;
                      font-weight: normal;
                      margin-bottom: 27px;
                      line-height: 30px;
                    ">
                                    <p style="margin-bottom: 2px; color: #333; font-weight: 600">
                                    <p>Hello ${username},</p>
                                    </p>
                                    <p style="margin-bottom: 2px; color: #333">

                                        You have received a response to your request. Below are the
                                        details of your request and our
                                        response:

                                        <br />

                                        <strong>Your Request Report:</strong>
                                        <br>
                                        ${reason}
                                    </p>
                                    <p style="margin-bottom: 2px; color: #333">

                                        <strong>Our Response:</strong>
                                        <br>
                                        ${message}

                                    </p>
                                    <p style="margin-bottom: 2px; color: #333">
                                        <strong>Note:</strong> If you are not satisfied with this response, you can
                                        either send another message
                                         or
                                        reply directly to this email for further assistance.
                                    </p>
                                </div>

                                <div style="
                      font-size: 15px;
                      font-weight: normal;
                      line-height: 30px;
                      margin: 40px 0px 0px 0px;
                    ">
                                    <p style="color: #333">
                                        Warm regards,<br />The <span>Dimpified</span> Team
                                    </p>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr style="
                display: flex;
                justify-content: center;
                margin: 0 25px 35px 25px;
                border-top: 1px solid #e7e9ed;
              ">
                        <td align="center" valign="center" style="
                  font-size: 13px;
                  text-align: left;
                  padding: 10px 0 0 0;
                  font-weight: 500;
                  color: #7e8299;
                ">
                            <p style="margin-bottom: 2px">
                                Thank you for choosing Dinmpified.
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
    `

    return sendEmail({
        to: email,
        subject: subject,
        html: messageContent
    });
};

module.exports = sendContactUsFeedbackEmail;
