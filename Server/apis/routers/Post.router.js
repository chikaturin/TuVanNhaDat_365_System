const express = require("express");
const router = express.Router();
const { checktokken } = require("../../middleware/middleware");
const {
  postContent,
  getContent,
} = require("../controllers/Post_new.controller");

router.post("/listings", checktokken, postContent);
router.get("/listings/", getContent);
