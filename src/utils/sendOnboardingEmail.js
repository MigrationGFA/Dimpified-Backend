const sendEmail = require("./sendEmail");

const sendOnboardingEmail = async ({
  email,
  fullName,
  organizationName,
  origin,
}) => {
  const onboardingLink = `${origin}/onboard-team-member/${email}`;

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
          <h2>Welcome ${fullName}!</h2>
          <p>You have been invited as a team member at ${organizationName}. To accept this invite, Click on the link below:
             </p>
          <a href="${onboardingLink}" class="button">Accept Invite</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${onboardingLink}</p>
          <p>If you didn't recognize this business, you may safely ignore this message.</p>
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
