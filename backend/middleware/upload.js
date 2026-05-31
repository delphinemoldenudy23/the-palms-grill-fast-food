const multer = require("multer");

const MAX_MB = 20;
const MAX_BYTES = MAX_MB * 1024 * 1024;

// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage();

const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"];
const allowedMime = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

const fileFilter = (_req, file, cb) => {
  const ext = file.originalname.toLowerCase().split(".").pop();
  const extWithDot = "." + ext;
  if (allowedMime.includes(file.mimetype) || allowedExt.includes(extWithDot)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Only image files (JPG, PNG, WEBP, GIF, HEIC) up to ${MAX_MB}MB`),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_BYTES },
});

module.exports = upload;
module.exports.MAX_MB = MAX_MB;
