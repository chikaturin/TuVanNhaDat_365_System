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
  checkToken,
  checktokenAPI,
  validateApiKey,
} = require("../../middleware/middleware");

router.post("/register", register);
router.post("/registerAD", validateApiKey, registerAD);
router.post("/checktokenAPI", checktokenAPI);
router.post("/login", login);
router.get("/listingUser", validateApiKey, checkToken, listUser);
router.get("/SearchUser/:PhoneNumber", validateApiKey, checkToken, search_User);
router.put("/UpdateRole", validateApiKey, checkToken, updateRole);
router.put("/BlockAccount", validateApiKey, checkToken, BlockAccount);

module.exports = router;