const path = require("path");
const fs = require("fs");
const multer = require("multer");

const MAX_MB = 20;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

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
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMime.includes(file.mimetype) || allowedExt.includes(ext)) {
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
