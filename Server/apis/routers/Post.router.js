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
<<<<<<< HEAD
  getListPost,
  getListPostWithApprovedTrue
} = require("../controllers/Post.controller");

// router.post("/listings", checkToken, postContent);
router.post("/postWithImage", upload, checkToken, postContentImage);
router.get("/listings", checkToken, getPropertyAD);
router.get("/listings/:_id", checkToken, getContentDetail);
router.put("/listings/state/:_id", updateStatePost);
router.delete("/listings/delete/:_id", deletePost);
router.put("/listings/update/:_id", updatePost);
router.get("/listings", getListPost);
router.get("/listingsApproved", getListPostWithApprovedTrue);
=======
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
>>>>>>> 8b839ecb47c41d4832f499c892400fa3483b373c

module.exports = router;
