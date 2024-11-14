const jwt = require("jsonwebtoken");

const generateAccessToken = (id, role) => {
  let token = jwt.sign({ id, role }, process.env.ACCESS_TOKEN, {
    expiresIn: "1d",
  });
  return token;
};

const generateRefreshToken = (id, role) => {
  let token = jwt.sign({ id, role }, process.env.REFRESH_TOKEN, {
    expiresIn: "14d",
  });
  return token;
};

const isAccessTokenValid = (token) =>
  jwt.verify(token, process.env.ACCESS_TOKEN);
const isRefreshTokenValid = (token) =>
  jwt.verify(token, process.env.REFRESH_TOKEN);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  isAccessTokenValid,
  isRefreshTokenValid,
};
