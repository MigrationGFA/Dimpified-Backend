const sendEmail = require("./sendEmail");

const sendWelcomeEmail = async ({ username, email }) => {
  const message = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Remsana</title>
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

      .experince {
        width: 100%;
        margin-top: -25px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .experince img {
        margin-top: -20px;
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

      .gettingStarted {
        margin-top: 45px;
        text-align: left;
      }

      .gettingStarted h1 {
        font-size: 18px;
        font-weight: 700;
      }

      .gettingStarted ul {
        text-align: left;
      }

      .gettingStarted ul :nth-child(n + 2):nth-child(-n + 3) {
        margin-top: 20px;
      }

      .gettingStarted p {
        margin-top: 50px;
      }

      .click {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .section-content button {
        width: 249px;
        height: 55px;
        background-color: black;
        border-radius: 10px;
        font-size: 24px;
        border: none;
        color: white;
        margin-top: 30px;
        cursor: pointer;
      }

      .last {
        margin-top: 50px;
      }

      footer {
        width: 100%;
        height: 203px;
        background-color: #151a9a;
        border-bottom-right-radius: 24px;
        border-bottom-left-radius: 24px;
        color: white;
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

      footer .store {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;
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
        <img src="./images/remsana-logo.png" alt="logo" />
      </header>
      <section class="section-content">
        <div class="experince">
          <p>Welcome to UNLEASHIFIED!</p>

          <img src="./images/person.png" alt="person" />
        </div>
        <p>Hello ${username}</p>
        <p>
          Welcome to <span>UNLEASHIFIED</span>, your premier platform for discovering exciting remote job opportunities! 
          We're thrilled to have you join our community, where you'll find a plethora of remote positions tailored to match your skills and preferences.
        </p>
        <div class="gettingStarted">
          <ul>
            <li>
              At Unleashified, we understand the evolving landscape of work, and we're dedicated to connecting talented individuals like yourself with top-notch remote roles from leading companies worldwide. 
              Whether you're seeking flexibility, autonomy, or the chance to work from anywhere, we've got you covered.
            </li>
            <li>
              As a member of Unleashified, you'll gain access to a curated selection of remote job listings spanning various industries, including tech, marketing, design, customer support, and more. 
              Our intuitive platform makes it easy to browse, apply, and track your job applications, ensuring a seamless experience from start to finish.
            </li>
            <li>
              But that's not all - Unleashified is more than just a job board. It's a vibrant community of remote professionals, offering networking opportunities, career resources, and insightful content to support your professional growth and success.
            </li>
          </ul>
          <p>
           So, whether you're embarking on a new remote career journey or seeking your next remote adventure, Unleashified is here to empower you every step of the way.

            Get started today by exploring our latest job listings and joining the conversation in our community forums. The remote career of your dreams awaits!


          </p>
        </div>
        <div class="click">
          <a
            href="https://unleashified-staging.azurewebsites.net/authentication/signin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button>Get Started Now</button>
          </a>
        </div>
        <p class="last">Welcome aboard,</p>
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
            <span>&copy;</span> 2024 Unleashified. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  </body>
</html>
`;

  return sendEmail({
    to: email,
    subject: "Welcome To UNLEASHIFIED",
    html: `<h4> Hello, ${username}</h4>
    ${message}
    `,
  });
};

module.exports = sendWelcomeEmail;
