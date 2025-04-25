const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Giới hạn 100MB nếu muốn
}).fields([
  { name: "images", maxCount: 9 },
  { name: "video", maxCount: 1 },
]);

module.exports = upload;
