const express = require("express");
const router = express.Router();
const {
  register,
  registerStaff,
  login,
  listUser,
  search_User,
  exportUser,
  updateRole,
} = require("../controllers/Authens.controller");
const { sendOTP } = require("../../services/OTP.service");
const { checkToken } = require("../../middleware/middleware");

router.post("/register", register);
router.post("/register-staff", registerStaff);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.get("/listingUser", listUser);
router.get("/SearchUser/:id", search_User);
router.post("/UpdateRole", checkToken, updateRole);

module.exports = router;