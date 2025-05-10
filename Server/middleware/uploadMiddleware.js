const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_ACCESS_KEY_ID,
  api_secret: process.env.CLOUD_SECRET_ACCESS_KEY,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Homez",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1000, crop: "limit", quality: "auto", fetch_format: "webp" },
    ],
  },
});

const uploadCloud = multer({
  storage,
  limits: { fileSize: Infinity },
});

module.exports = uploadCloud;
