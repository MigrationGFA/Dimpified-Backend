const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Only 50 requests allowed for login route
  message: "Too many login attempts, please try again later",
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many reset password attempts, please try again later",
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

module.exports = {
  authLimiter,
  resetPasswordLimiter,
  limiter,
};
