const sendEmail = require("./sendEmail");

const sendBookingPaymentConfirmationEmail = async ({
  email,
  name,
  bookingId,
  paymentAmount,
  paymentDate,
  paymentMethod,
}) => {
  const formattedPaymentDate = new Date(paymentDate).toLocaleDateString();

  const message = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Confirmation</title>
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
        </style>
      </head>

      <body>
      <main class="container">
        <header class="header">
          <img src="./images/remsana-logo.png" alt="Remsana Logo" />
        </header>
    
        <section class="section-content">
          <h1>Payment Confirmation</h1>
          <p>Dear Provider,</p>
          <p>We are pleased to inform you that the booking with ID <strong>${bookingId}</strong> has been successfully confirmed, and the payment has been processed.</p>
          <p><strong>Payment Details:</strong></p>
          <ul>
            <li><strong>Amount:</strong> $${paymentAmount}</li>
            <li><strong>Date:</strong> ${formattedPaymentDate}</li>
            <li><strong>Method:</strong> ${paymentMethod}</li>
          </ul>
          <p>Thank you for your continued partnership with us.</p>
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
    subject: "Booking Payment Confirmation",
    html: message,
  });
};

module.exports = sendBookingPaymentConfirmationEmail;
