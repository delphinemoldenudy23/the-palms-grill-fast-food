const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const {
  upload,
  deleteUpload,
} = require("../controllers/uploadController");

// Upload image
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      imageUrl: req.file.path,
      imagePath: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete image
router.delete("/:filename", protect, deleteUpload);

module.exports = router;