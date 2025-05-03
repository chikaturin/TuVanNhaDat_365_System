const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
}).fields([
  { name: "images", maxCount: 9 },
  { name: "video", maxCount: 1 },
]);

module.exports = upload;
