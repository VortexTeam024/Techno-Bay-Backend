const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "images"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1 }, // 1MB
  fileFilter
});

module.exports = upload;