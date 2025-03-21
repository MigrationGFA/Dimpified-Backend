const sendEmail = require("./sendEmail");

const sendSupportReplyEmail = async ({ 
  email, 
  username, 
  supportMessage,  // The original message from the user
  replyMessage, 
  merchantLogo, 
  merchantName 
}) => {
  const message = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Support Ticket Reply</title>
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Outfit&display=swap");

          body {
            margin: 0;
            padding: 20px;
            font-family: "Outfit", sans-serif;
            background-color: #f8f8f8;
            line-height: 1.5;
            font-size: 15px;
            color: #2f3044;
          }

          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 12px;
            margin: 40px auto;
            max-width: 600px;
            text-align: left;
          }

          .header img {
            width: 120px;
            margin-bottom: 20px;
          }

          .section-content p {
            font-size: 16px;
            margin-bottom: 10px;
          }

          .message-box {
            background: #f4f4f4;
            padding: 15px;
            border-left: 5px solid #151a9a;
            font-style: italic;
            margin-bottom: 15px;
          }

          footer {
            margin-top: 20px;
            font-size: 14px;
            color: gray;
            text-align: center;
          }
        </style>
      </head>

      <body>
        <main class="container">
          <header class="header">
            <img src="${merchantLogo}" alt="Merchant Logo" />
          </header>
          <section class="section-content">
            <p>Dear ${username},</p>
            <p>We have received and reviewed your support request:</p>
            <div class="message-box"><strong>Your Message:</strong> ${supportMessage}</div>
            <p>Here is our response:</p>
            <div class="message-box"><strong>Reply:</strong> ${replyMessage}</div>
            <p>If you need further assistance, feel free to reach out again.</p>
          </section>
          <footer>
            <p>&copy; 2024 ${merchantName}. All rights reserved.</p>
          </footer>
        </main>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Support Ticket Reply",
    html: message,
  });
};

module.exports = sendSupportReplyEmail;
