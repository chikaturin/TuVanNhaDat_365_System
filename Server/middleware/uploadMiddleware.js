const multer = require("multer");

// Dùng bộ nhớ tạm (RAM) thay vì lưu vào file hệ thống
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // tối đa 10MB mỗi ảnh
  },
});

module.exports = upload;
