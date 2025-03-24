const sendEmail = require("./sendEmail");

const sendOnboardingEmail = async ({ email, fullName, organizationName, origin }) => {
  const onboardingLink = `https://${origin}api/v1/onboard-team-member`;

  const message = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to ${organizationName}!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: auto;
          }
          h2 {
            color: #151a9a;
          }
          p {
            font-size: 16px;
            color: #333;
          }
          .button {
            display: inline-block;
            padding: 12px 20px;
            font-size: 16px;
            color: white;
            background-color: #151a9a;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome to ${organizationName}, ${fullName}!</h2>
          <p>Your account has been created as a team member. To complete your onboarding, click the button below:</p>
          <a href="${onboardingLink}" class="button">Complete Onboarding</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${onboardingLink}</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to ${organizationName}! Complete Your Onboarding`,
    html: message,
  });
};

module.exports = sendOnboardingEmail;
