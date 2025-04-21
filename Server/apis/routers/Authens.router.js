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

router.post("/registerAD", validateApiKey, registerAD);
router.post("/checktokenAPI", checktokenAPI);

router.post("/register", register);
router.post("/login", login);
router.get("/listingUser", validateApiKey, checktoken, listUser);
router.get("/searchUser/:PhoneNumber", validateApiKey, checktoken, search_User);
router.put("/updateRole", validateApiKey, checktoken, updateRole);
router.put(
  "/blockAccount/:PhoneNumber",
  validateApiKey,
  checktoken,
  BlockAccount
);
router.get("/exportUser", validateApiKey, checktoken, exportUser);
module.exports = router;