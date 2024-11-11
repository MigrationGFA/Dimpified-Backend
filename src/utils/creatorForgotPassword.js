const sendEmail = require("./sendEmail");

const sendForgotPasswordEmailCreator = async ({
  username,
  email,
  token,
  origin,
}) => {
  const resetURL = `${origin}/creator/reset-password?token=${token}&email=${email}`;
  const message = `
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif;">
      <tr>
        <td align="center" style="padding: 20px 0; background-color:  #f8f8f8;">
          <img alt="Dimpified Logo"
                        src="https://res.cloudinary.com/diz6tdgeo/image/upload/v1725638667/dimp_rwgeri.png" style="display: block; margin: 0 auto; height: 100px" />
        </td>
      </tr>
      <tr>
        <td align="center" style="background-color: #f8f8f8; padding: 30px;">
          <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <tr>
              <td align="center" style="padding: 40px; font-size: 20px; font-weight: bold; color: #1e2239;">
                Password Recovery Request
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 0 40px 40px; color: #333333; font-size: 16px;">
                <p> <strong> Hello ${username},</strong></p>
                <p>To Change your password on Dimpified. Please change your password by clicking the button below.</p>
              </td>
            </tr>
            <tr>
              <td align="center">
                <a href="${resetURL}" style="display: inline-block; padding: 12px 24px; background-color: #1e2239; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">
                  Password Reset
                </a>
              </td>
            </tr>
             <tr>
              <td align="center" style="font-size: 20px;">
               <p> <strong>OR</strong></p>
               <p> copy and paste the link below in your browser</p>
                ${resetURL}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 20px 40px 40px; font-size: 14px; color: #999999;">
                <p>If you did not request for this action, please ignore it and make sure to not share this link with anyone as no DIMP staff will ask for this.</p>
              </td>
            </tr>
             <tr>
              <td align="center" style="padding: 10px 20px 20px; font-size: 14px; color: #999999;">
                <p>&copy; Dimpified | All Rights Reserved</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
     
    </table>`;


  // const message = `<p>Please reset your password by clicking on the following link: 
  //   <a href="${resetURL}">Reset Password</a></p>`;

  return sendEmail({
    to: email,
    subject: "Dimpified Reset Password",
    html: `<h4>Hello, ${username}</h4>
      ${message}`,
  });
};

module.exports = sendForgotPasswordEmailCreator;
