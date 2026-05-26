const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const upload = require("../middleware/upload");
const { MAX_MB } = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");
const { getUploadFilename } = require("../lib/imageUrl");

const router = express.Router();
const uploadDir = path.join(__dirname, "../uploads");

const getBaseUrl = (req) => {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;
  const host = req.get("host");
  const proto = req.protocol || "http";
  return host ? `${proto}://${host}` : `http://localhost:${process.env.PORT || 5000}`;
};

router.post("/", protect, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: `Image must be under ${MAX_MB}MB` });
      }
      return res.status(400).json({ message: err.message || "Upload failed" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please choose an image file" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const imageUrl = `${getBaseUrl(req)}${imagePath}`;

    res.status(201).json({
      message: "Image uploaded",
      imageUrl,
      imagePath,
      filename: req.file.filename,
    });
  });
});

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

    res.json({ message: "Image deleted", filename });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not delete image" });
  }
});

router.delete("/", protect, (req, res) => {
  try {
    const imageRef = req.body?.image || req.body?.imageUrl || req.body?.imagePath;
    const filename = getUploadFilename(imageRef) || path.basename(imageRef || "");

    if (!filename || filename.includes("..")) {
      return res.status(400).json({ message: "No uploaded image to delete" });
    }

    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Image deleted", filename });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not delete image" });
  }
});

module.exports = router;
