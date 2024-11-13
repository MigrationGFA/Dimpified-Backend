const sendEmail = require("./sendEmail");

const userWelcomeEmail = ({ username, email, ecosystemName, logo, login }) => {
  const message = `
      <!DOCTYPE html>
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
              <img src="https://res.cloudinary.com/diz6tdgeo/image/upload/v1725638667/dimp_rwgeri.png" alt="logo" 
              style="display: block; margin: 0 auto; height: 100px"
              />
            </header>
            <section class="section-content">
              <div class="experince">
                <p>Welcome to ${ecosystemName}!</p>
                // <img src="./images/person.png" alt="person" />
              </div>
              <p>Hello ${username},</p>
              <p>
                Welcome to <span>${ecosystemName}</span>! You are now part of the <span>${ecosystemName}</span> community. We're excited to have you join our community.
              </p>

              <div class="click">
                <a
                  href=${login}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button>Get Started Now</button>
                </a>
              </div>
              <p class="last">Welcome aboard,</p>
              <p>The <span>${ecosystemName}</span> Team.</p>
            </section>
            <footer>
                <p class="copyright">
                  <span>&copy;</span> 2024 ${ecosystemName}. All rights reserved.
                </p>
              </div>
            </footer>
          </main>
        </body>
      </html>
    `;

  return sendEmail({
    to: email,
    subject: `Welcome To ${ecosystemName}`,
    html: message,
  });
};

module.exports = userWelcomeEmail;
