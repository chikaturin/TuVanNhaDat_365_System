const express = require("express");
const router = express.Router();
const {
  register,
  registerStaff,
  login,
} = require("../controllers/Authens.controller");
const { sendOTP } = require("../../services/OTP.service");

router.post("/register", register);
router.post("/register-staff", registerStaff);
router.post("/login", login);
router.post("/send-otp", sendOTP);

module.exports = router;
