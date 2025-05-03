const express = require("express");
const router = express.Router();
const upload = require("../../middleware/uploadMiddleware");
const { checkToken } = require("../../middleware/middleware");
const {
  // postContent,
  getPropertyAD,
  getPropertyDetail,
  updateStatePost,
  deletePost,
  updatePost,
  postContentImage,
  getListPost,
  getProperty,
} = require("../controllers/Post.controller");

// router.post("/listings", checkToken, postContent);
router.post("/postWithImage", upload, checkToken, postContentImage);
router.get("/getPropertyAD", checkToken, getPropertyAD);
router.get("/listings", getProperty);
router.get("/listings/:id", checkToken, getPropertyDetail);
router.get("/listings-state/:id", checkToken, updateStatePost);
router.delete("/listings-delete/:id", deletePost);
router.put("/listings-update/:_id", upload, checkToken, updatePost);
router.get("/listings", getListPost);

module.exports = router;
