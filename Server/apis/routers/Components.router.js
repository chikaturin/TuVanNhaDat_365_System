const express = require("express");
const router = express.Router();

const {
  getListAmenities,
  addAmenities,
  updateAmenities,
  removeAmenities,

  listCategory,
  addCategory,
  updateCategory,
  removeCategory,

  getLocation,
  addLocation,
  updateLocation,
  removeLocation,

  getNotification,
  addNotification,
  updateNotification,
  deleteNotification,
} = require("../controllers/Components.controller");

const { checkToken } = require("../../middleware/middleware");

router.post("/notification", addNotification);
router.put("/notification/:id", updateNotification);
router.delete("/notification/:id", deleteNotification);
router.get("/notification", getNotification);

router.get("/listing-amenities", getListAmenities);
router.post("/add-amenities", checkToken, addAmenities);
router.put("/update-amenities/:id", checkToken, updateAmenities);
router.delete("/delete-amenities/:id", checkToken, removeAmenities);

router.post("/add-category", checkToken, addCategory);
router.get("/listing-category", listCategory);
router.put("/update-category/:id", checkToken, updateCategory);
router.delete("/delete-category/:id", checkToken, removeCategory);

router.post("/add-location", checkToken, addLocation);
router.get("/listing-location", getLocation);
router.put("/update-location/:id", checkToken, updateLocation);
router.delete("/delete-location/:id", checkToken, removeLocation);

module.exports = router;
