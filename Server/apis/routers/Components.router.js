const express = require("express");
const router = express.Router();

const {
  addLocation,
  addcategory,
  addNotification,
  updateNotification,
  deleteNotification,
  getNotification,
} = require("../controllers/components.controller");

router.post("/location", addLocation);
router.post("/category", addcategory);
router.post("/notification", addNotification);
router.put("/notification/:id", updateNotification);
router.delete("/notification/:id", deleteNotification);
router.get("/notification", getNotification);
