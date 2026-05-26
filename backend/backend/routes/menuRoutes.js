const express = require("express");
const router = express.Router();

const {
  getMenu,
  createMenuItem,
  updateMenuItem,
  updateMenuImage,
  deleteMenuItem,
} = require("../controllers/menuController");

router.get("/", getMenu);
router.post("/", createMenuItem);
router.patch("/:id/image", updateMenuImage);
router.put("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);

module.exports = router;