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
  checkPhone,
} = require("../controllers/Authens.controller");
const { resetOTP } = require("../../services/OTP.service");
const {
  checkToken,
  checkTokenAPI,
  validateApiKey,
} = require("../../middleware/middleware");

router.post("/registerAD", validateApiKey, registerAD);
router.post("/checktokenAPI", checkTokenAPI);

router.post("/register", register);
router.post("/login", login);
router.get("/listingUser", validateApiKey, checkToken, listUser);
router.get("/searchUser/:PhoneNumber", validateApiKey, checkToken, search_User);
router.put("/updateRole", validateApiKey, checkToken, updateRole);
router.get(
  "/blockAccount/:PhoneNumber",
  validateApiKey,
  checkToken,
  BlockAccount
);
router.get("/exportUser", validateApiKey, checkToken, exportUser);
router.get("/resetOTP/:PhoneNumber", validateApiKey, checkToken, resetOTP);

module.exports = router;
