const sendEmail = require("./sendEmail");

const sendBookingConfirmationEmail = async ({
  email,
  name,
  bookingId,
  service,
  bookingType,
  date,
  time,
}) => {
  const formattedDate = new Date(date).toLocaleDateString();
  const message = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Booking Confirmation</title>
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Outfit&display=swap");

          body {
            margin: 0;
            padding: 20px;
            font-family: "Outfit", sans-serif;
            background-color: #f8f8f8;
            line-height: 1.5;
            min-height: 100%;
            font-weight: normal;
            font-size: 15px;
            color: #2f3044;
          }

          p,
          h1,
          h2 {
            line-height: 22.68px;
          }

          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: #ffffff;
            padding: 45px 0;
            border-radius: 24px;
            margin: 40px auto;
            max-width: 600px;
            color: black;
            font-size: 18px;
            font-weight: 400;
          }

          .header img {
            width: 150px;
            margin-bottom: 20px;
          }

          .section-content {
            padding: 20px;
            text-align: left;
            width: 100%;
          }

          .section-content p {
            font-size: 18px;
            margin-bottom: 15px;
          }

          .section-content span {
            color: #4033f5;
            font-weight: 600;
          }

          footer {
            width: 100%;
            background-color: #151a9a;
            border-bottom-right-radius: 24px;
            border-bottom-left-radius: 24px;
            color: white;
            font-weight: 700;
            font-size: 18px;
            text-align: center;
            padding: 20px 0;
          }

          footer p {
            margin: 0;
            font-size: 16px;
            font-weight: 300;
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
        </style>
      </head>

      <body>
        <main class="container">
          <header class="header">
            <img src="./images/remsana-logo.png" alt="logo" />
          </header>
          <section class="section-content">
            <p>Dear ${name},</p>
            <p>You have received a new booking with the following details:</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Booking Type:</strong> ${bookingType}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p>Thank you for being a part of our service platform!</p>
          </section>
          <footer>
            <p>&copy; 2024 Your Company. All rights reserved.</p>
          </footer>
        </main>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "New Booking Confirmation",
    html: message,
  });
};

module.exports = sendBookingConfirmationEmail;
