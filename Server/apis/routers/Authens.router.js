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
  me,
  logout,
} = require("../controllers/Authens.controller");
const { resetOTP } = require("../../services/OTP.service");
const {
  checkToken,
  checkTokenAPI,
  validateApiKey,
  checkTokenAPI2,
} = require("../../middleware/middleware");

router.post("/registerAD", validateApiKey, registerAD);
router.post("/checktokenAPI", validateApiKey, checkTokenAPI);
router.post("/checktokenAPI2", validateApiKey, checkTokenAPI2);

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

router.get("/me", me);
router.get("/logout", logout);
module.exports = router;
