const express = require("express");
const {
  developerSignup,
  // developerLogin,
} = require("../controllers/DeveloperController/registration");
const router = express.Router();

router.post("/developer/registration", developerSignup);
// router.post("/developer/login", developerLogin);

module.exports = router;
