const sendEmail = require("./sendEmail");

const sendWelcomeEmail = async ({ username, email }) => {
  const message = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Dimpified</title>
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
        padding-top: 10px;
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
          <p>Welcome to Dimpified!</p>
          <img src="./images/person.png" alt="person" />
        </div>
        <p>Hello ${username},</p>
        <p>
          Welcome to <span>Dimpified</span>, your premier platform for creating
          ecosystems across all fields of life! We're excited to have you join
          our community, where you can educate your staff, organization, or the
          public on any subject matter through video, document, or audio.
        </p>
        <div class="gettingStarted">
          <ul>
            <li>
              At Dimpified, we understand the importance of knowledge sharing
              and are dedicated to providing you with the tools to create
              comprehensive educational ecosystems. Whether it's training your
              team, educating your organization, or sharing information with the
              public, our platform has got you covered.
            </li>
            <li>
              Dimpified offers a seamless experience for you to create your
              ecosystem, onboard users, and train your ecosystem users.
            </li>
            <li>
              Dimpified offers a seamless experience to create and share
              educational content in various formats. Our intuitive platform
              allows you to upload videos, documents, and audio files, ensuring
              you can deliver information in the most effective way possible.
            </li>
            <li>
              More than just a content-sharing platform, Dimpified is a vibrant
              community of educators and learners. Engage with others, share
              insights, and grow together with our supportive community.
            </li>
          </ul>
          <p>
            Whether you're starting a new educational initiative or enhancing
            your current training programs, Dimpified is here to support you
            every step of the way. Begin your journey today by exploring our
            features and connecting with our community.
          </p>
        </div>
        <div class="click">
          <a
            href="https://dimpified.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button>Get Started Now</button>
          </a>
        </div>
        <p class="last">Welcome aboard,</p>
        <p>The <span>Dimpified</span> Team.</p>
      </section>
      <footer>
        <div class="wrapper">
          <h2>Follow us</h2>
          <div class="social-media">
            <a
              href="https://web.facebook.com/dimpified"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                alt="facebook"
                style="cursor: pointer; height: 30px"
              />
            </a>
            <a
              href="https://instagram.com/dimpified"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                alt="instagram"
                style="cursor: pointer; height: 30px"
              />
            </a>
            <a
              href="https://twitter.com/dimpified"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg"
                alt="twitter"
                style="cursor: pointer; height: 30px"
              />
            </a>
            <a
              href="https://www.linkedin.com/company/dimpified"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg"
                alt="linkedin"
                style="cursor: pointer; height: 30px"
              />
            </a>
            <a
              href="https://www.youtube.com/dimpified"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png"
                alt="youtube"
                style="cursor: pointer; height: 30px; margin-left: 15px"
              />
            </a>
          </div>
          <p class="copyright">
            <span>&copy;</span> 2024 Dimpified. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  </body>
</html>
`;

  return sendEmail({
    to: email,
    subject: "Welcome To DIMPIFIED",
    html: `<h4> Hello, ${username}</h4>
    ${message}
    `,
  });
};

module.exports = sendWelcomeEmail;
