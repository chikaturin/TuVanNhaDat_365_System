const express = require("express");
const router = express.Router();
const uploadCloud = require("../../middleware/uploadMiddleware");
const { checkToken } = require("../../middleware/middleware");
const {
  // postContent,
  getPropertyAD,
  getPropertyDetail,
  updateStatePost,
  deletePost,
  updatePost,
  postContentImage,
  getProperty,
} = require("../controllers/Post.controller");

// router.post("/listings", checkToken, postContent);
router.post(
  "/postWithImage",
  uploadCloud.array("images", 9),
  checkToken,
  postContentImage
);
router.get("/getPropertyAD", checkToken, getPropertyAD);
router.get("/listings", getProperty);
router.get("/listings/:id", checkToken, getPropertyDetail);
router.get("/listings-state/:id", checkToken, updateStatePost);
router.delete("/listings-delete/:id", deletePost);
router.put(
  "/listings-update/:_id",
  uploadCloud.array("images", 9),
  checkToken,
  updatePost
);

module.exports = router;
