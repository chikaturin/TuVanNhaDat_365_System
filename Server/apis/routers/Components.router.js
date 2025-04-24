const express = require("express");
const router = express.Router();

const {
  addLocation,
  addCategory,
  addNotification,
  updateNotification,
  deleteNotification,
  getNotification,
  addAmenities,
} = require("../controllers/Components.controller");

router.post("/location", addLocation);
router.post("/category", addCategory);
router.post("/notification", addNotification);
router.put("/notification/:id", updateNotification);
router.delete("/notification/:id", deleteNotification);
router.get("/notification", getNotification);
router.post("/amenities", addAmenities);

module.exports = router;
