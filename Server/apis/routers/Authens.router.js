const express = require("express");
const router = express.Router();
const {
  register,
  login,
  listUser,
  search_User,
  exportUser,
  updateRole,
  registerAD,
  BlockAccount,
} = require("../controllers/Authens.controller");
const { sendOTP } = require("../../services/OTP.service");
const {
  checktoken,
  checktokenAPI,
  validateApiKey,
} = require("../../middleware/middleware");

router.post("/register", register);
router.post("/registerAD", validateApiKey, registerAD);
router.post("/checktokenAPI", checktokenAPI);
router.post("/login", login);
router.get("/listingUser", validateApiKey, checktoken, listUser);
router.get("/SearchUser/:PhoneNumber", validateApiKey, checktoken, search_User);
router.put("/UpdateRole", validateApiKey, checktoken, updateRole);
router.put("/BlockAccount", validateApiKey, checktoken, BlockAccount);

module.exports = router;