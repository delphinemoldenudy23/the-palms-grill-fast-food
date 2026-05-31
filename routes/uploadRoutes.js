const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { getUploadFilename } = require("../lib/imageUrl");

const router = express.Router();
const uploadDir = path.join(__dirname, "../uploads");

// Ensure upload folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Base URL helper
const getBaseUrl = (req) => {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;
  const host = req.get("host");
  const proto = req.protocol || "http";
  return host ? `${proto}://${host}` : `http://localhost:${process.env.PORT || 5000}`;
};

// 🔥 SINGLE MULTER CONFIG (CLEAN & CONTROLLED)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB stable for Render
  },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|heic|heif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);

    if (ext && mime) return cb(null, true);

    cb(new Error("Only image files are allowed"));
  },
});

// ===============================
// UPLOAD IMAGE
// ===============================
router.post("/", protect, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "Image too large (max 25MB)",
          });
        }
      }

      return res.status(400).json({
        message: err.message || "Upload failed",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No image selected",
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const imageUrl = `${getBaseUrl(req)}${imagePath}`;

    return res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl,
      imagePath,
      filename: req.file.filename,
    });
  });
});

// ===============================
// DELETE BY FILENAME
// ===============================
router.delete("/:filename", protect, (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

    if (!filename || filename.includes("..")) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Deleted successfully", filename });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Delete failed",
    });
  }
});

// ===============================
// DELETE BY IMAGE REF
// ===============================
router.delete("/", protect, (req, res) => {
  try {
    const imageRef =
      req.body?.image || req.body?.imageUrl || req.body?.imagePath;

    const filename =
      getUploadFilename(imageRef) || path.basename(imageRef || "");

    if (!filename || filename.includes("..")) {
      return res.status(400).json({
        message: "No valid image found",
      });
    }

    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Deleted successfully", filename });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Delete failed",
    });
  }
});

module.exports = router;