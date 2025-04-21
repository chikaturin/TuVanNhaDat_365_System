const express = require("express");
const router = express.Router();
const { checkToken } = require("../../middleware/middleware");
const {
  postContent,
  // getContent,
  getContentDetail,
  updateStatePost,
  deletePost,
  updatePost,
} = require("../controllers/Post.controller");

router.post("/listings", checkToken, postContent);
// router.get("/listings/", getContent);
router.get("/listings/:_id", checkToken, getContentDetail);
router.put("/listings/state/:_id", updateStatePost);
router.delete("/listings/delete/:_id", deletePost);
router.put("/listings/update/:_id", updatePost);

module.exports = router;
