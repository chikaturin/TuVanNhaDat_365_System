const express = require("express");
const router = express.Router();

const { verifyOTP, sendOTP } = require("../controllers/Email.controller");


router.post("/sendOTP", sendOTP);
router.post("/verifyOTP", verifyOTP);

module.exports = router;