const sendEmail = require("./sendEmail");

const sendResetPasswordAlert = async ({ username, email, origin }) => {
  const resetURL = `${origin}/support`;

  const message = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>UNLEASHIFIED RESET PASSWORD</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Outfit&display=swap");

      body {
        margin: 0;
        padding: 20px 20px 0 20px;
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
        height: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #ffffff;
        padding: 45px 0 0 0;
        border-radius: 24px;
        margin: 40px auto;
        max-width: 600px;
        color: black;
        font-size: 18px;
        font-weight: 400;
      }

      .header {
        margin-top: 40px;
      }

      .section-content {
        padding: 20px;
      }

      .section-content p h1 {
        font-size: 18px;
      }

      .section-content span {
        color: #4033f5;
        font-weight: 600;
      }

      .last {
        margin-top: 50px;
      }

      footer {
        width: 100%;
        height: 203px;
        background-color: #151a9a;
        color: white;
        border-bottom-right-radius: 24px;
        border-bottom-left-radius: 24px;
        font-weight: 700;
        font-size: 18px;
      }

      footer .wrapper {
        padding-left: 20px;
        padding-right: 20px;
        padding-bottom: 60px;
      }

      footer .social-media :nth-child(n + 2):nth-child(-n + 4) {
        margin-left: 20px;
      }

      footer .download {
        text-align: center;
        margin-top: 40px;
      }

      footer p {
        text-align: center;
        font-weight: 300;
      }

      footer p:nth-child(1) {
        margin-top: 20px;
        text-align: center;
      }

      footer span {
        font-size: 22px;
        margin-right: 10px;
      }

      footer .copyright {
        margin-top: 50px;
      }
    </style>
  </head>
  <body>
    <main class="container">
      <header class="header">
        <img  alt="Unleashified Logo"
                        src="https://res.cloudinary.com/djhnaee9k/image/upload/v1714038296/et5gicqtnuw4u1tqujjr.png"
                        style="height: 60px" />
      </header>
      <section class="section-content">
        <p>Hello ${username}</p>
        <p>
          Your <span>UNLEASHIFIED</span> Account was successfully changed. If
          you did not initiate this process, please contact our  <a href="${resetURL}"><span>support</span></a></p> team in
          order to help you get you account back
        </p>

        <p class="last">Best regards,</p>
        <p>The <span>UNLEASHIFIED</span> Team.</p>
      </section>
      <footer>
        <div class="wrapper">
          <h2>Follow us</h2>
          <div class="social-media">
            <a
              href="https://web.facebook.com/getfundedafricaoffical?_rdc=1&_rdr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="./images/facebook.png"
                alt="facebook"
                style="cursor: pointer; height: 30px"
              />
            </a>
            <a href="" target="_blank" rel="noopener noreferrer">
              <img
                src="./images/instagram.png"
                alt="instagram"
                style="cursor: pointer; height: 30px"
              />
            </a>
            <a
              href="https://twitter.com/gfunded_africa"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="./images/twitter.png"
                alt="twitter"
                style="cursor: pointer; height: 30px"
              />
            </a>
            <a
              href="https://www.linkedin.com/company/gfa-technologies/mycompany/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="./images/linkedlin.png"
                alt="linkedil"
                style="cursor: pointer; height: 30px"
              />
            </a>
            <a
              href="https://www.youtube.com/channel/UCADl1rDbt5BGQKkMfMBxsOQ"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="./images/youtube.png"
                alt="linkedil"
                style="cursor: pointer; height: 30px; margin-left: 15px"
              />
            </a>
          </div>
          <p class="copyright">
            <span>&copy;</span> 2024 Remsana. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  </body>
</html>
</p>`;

  return sendEmail({
    to: email,
    subject: "UNLEASHIFIED Reset Password",
    html: `<h4> Hello, ${username}</h4>
    ${message}
    `,
  });
};

module.exports = sendResetPasswordAlert;
