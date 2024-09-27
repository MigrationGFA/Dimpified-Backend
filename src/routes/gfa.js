const express = require("express");
const router = express.Router();

const {
    gfaLoginCreator
} = require("../controllers/GFAAdmin/creatorLogin")

// admin login for creator 
router.get("/gfa-creator-login/:email",  gfaLoginCreator);


module.exports = router;
