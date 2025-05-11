const express = require("express");
const router = express.Router();
const {
  sendContact,
  getContact,
  updateContact,
} = require("../controllers/Contact.controller");
const { checkToken } = require("../../middleware/middleware");

router.post("/sendContact", sendContact);
router.get("/getContact", checkToken, getContact);
router.put("/updateContact/:id", checkToken, updateContact);

module.exports = router;
