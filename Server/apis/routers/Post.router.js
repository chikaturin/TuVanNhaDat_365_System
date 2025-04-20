const express = require("express");
const router = express.Router();
const { checkToken } = require("../../middleware/middleware");
const {
  postContent,
  getContent,
  getContentDetail,
  updateStatePost,
  deletePost,
  updatePost,
} = require("../controllers/Post_new.controller");

router.post("/listings", checkToken, postContent);
router.get("/listings/", getContent);
router.get("/listings/:id", checkToken, getContentDetail);
router.put("/listings/:id", updateStatePost);
router.delete("/listings/:id", deletePost);
router.put("/listings/update/:id", updatePost);

module.exports = router;
