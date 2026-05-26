const express = require("express");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [items, orders] = await Promise.all([
      MenuItem.countDocuments(),
      Order.find().sort({ createdAt: -1 }),
    ]);

    const active = orders.filter((o) => o.status !== "cancelled");

    const revenue = active
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingMomo = active
      .filter((o) => o.paymentMethod === "momo" && o.paymentStatus !== "paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingMomoCount = active.filter(
      (o) => o.paymentMethod === "momo" && o.paymentStatus !== "paid"
    ).length;

    const uniquePhones = new Set(orders.map((o) => o.customerPhone)).size;

    res.json({
      items,
      orders: orders.length,
      users: uniquePhones,
      revenue,
      pendingMomo,
      pendingMomoCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
