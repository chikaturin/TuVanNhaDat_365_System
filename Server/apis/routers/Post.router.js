const express = require("express");
const router = express.Router();
const uploadLocal = require("../../middleware/uploadMiddleware");
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
  addHighlightTag,
  updatePostUser,
  listingPortUser,
} = require("../controllers/Post.controller");

// router.post("/listings", checkToken, postContent);
router.post(
  "/postWithImage",
  uploadLocal.array("images", 9),
  checkToken,
  postContentImage
);
router.get("/getPropertyAD", checkToken, getPropertyAD);
router.get("/listings", getProperty);
router.get("/listings/:id", getPropertyDetail);
router.get("/listings-state/:id", checkToken, updateStatePost);
router.delete("/listings-delete/:id", deletePost);
router.put(
  "/listings-updateAD/:_id",
  uploadLocal.array("images", 9),
  checkToken,
  updatePost
);
router.put(
  "/listings-update/:_id",
  uploadLocal.array("images", 9),
  checkToken,
  updatePostUser
);

router.put("/addHighlightTag/:_id", checkToken, addHighlightTag);
router.get("/listingPortUser", checkToken, listingPortUser);

module.exports = router;
