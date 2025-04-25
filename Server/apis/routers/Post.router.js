const express = require("express");
const router = express.Router();
const upload = require("../../middleware/uploadMiddleware");
const { checkToken } = require("../../middleware/middleware");
const {
  postContent,
  // getContent,
  getContentDetail,
  updateStatePost,
  deletePost,
  updatePost,
  postContentImage,
  getListPost,
} = require("../controllers/Post.controller");

router.post("/listings", checkToken, postContent);
router.post("/postWithImage",upload, postContentImage);
// router.get("/listings/", getContent);
router.get("/listings/:_id", checkToken, getContentDetail);
router.put("/listings/state/:_id", updateStatePost);
router.delete("/listings/delete/:_id", deletePost);
router.put("/listings/update/:_id", updatePost);
router.get("/listings", getListPost);

module.exports = router;
