const express = require("express");
const router = express.Router();
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage (IMPORTANT)
const upload = multer({ storage: multer.memoryStorage() });

// Upload image to Cloudinary
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "palms-grill",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    console.log("Cloudinary upload success:", result.secure_url);

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.log("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;