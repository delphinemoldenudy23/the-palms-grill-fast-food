const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { MAX_MB } = require("../middleware/upload");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_MB * 1024 * 1024,
  },
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "palms-grill",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create a readable stream from the buffer
    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(buffer);
    readableStream.push(null);

    readableStream.pipe(uploadStream);
  });
};

// Helper function to delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
};

// UPLOAD IMAGE
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    console.log("Image uploaded to Cloudinary:", {
      public_id: result.public_id,
      secure_url: result.secure_url,
    });

    res.json({
      message: "Image uploaded",
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: "Failed to upload image to Cloudinary" });
  }
});

// DELETE IMAGE
router.delete("/", protect, async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: "Public ID is required for deletion" });
    }

    const deleted = await deleteFromCloudinary(public_id);

    if (deleted) {
      console.log("Image deleted from Cloudinary:", public_id);
      res.json({ message: "Image deleted", public_id });
    } else {
      res.status(500).json({ message: "Failed to delete image from Cloudinary" });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: err.message || "Could not delete image" });
  }
});

module.exports = router;