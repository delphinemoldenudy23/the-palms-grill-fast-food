const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getMenu,
  createMenuItem,
  updateMenuItem,
  updateMenuImage,
  deleteMenuItem,
} = require("../controllers/menuController");

router.get("/", getMenu);
router.post("/", protect, createMenuItem);
router.patch("/:id/image", protect, updateMenuImage);
router.put("/:id", protect, updateMenuItem);
router.delete("/:id", protect, deleteMenuItem);

module.exports = router;