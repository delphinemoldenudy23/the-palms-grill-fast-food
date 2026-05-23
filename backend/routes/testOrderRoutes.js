const express = require("express");
const router = express.Router();

// TEST ROUTE ONLY
router.post("/", (req, res) => {
  console.log("TEST ORDER RECEIVED:", req.body);
  res.json({ message: "Order route working" });
});

module.exports = router;