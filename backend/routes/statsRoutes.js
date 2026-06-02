const express = require("express");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const Settings = require("../models/Settings");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    const statsResetDate = settings.statsResetDate;

    const [items, orders] = await Promise.all([
      MenuItem.countDocuments(),
      Order.find().sort({ createdAt: -1 }),
    ]);

    // Filter orders based on reset date if it exists
    const filteredOrders = statsResetDate
      ? orders.filter((o) => new Date(o.createdAt) >= statsResetDate)
      : orders;

    const active = filteredOrders.filter((o) => o.status !== "cancelled");

    const revenue = active
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingMomo = active
      .filter((o) => o.paymentMethod === "momo" && o.paymentStatus !== "paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const pendingMomoCount = active.filter(
      (o) => o.paymentMethod === "momo" && o.paymentStatus !== "paid"
    ).length;

    const uniquePhones = new Set(filteredOrders.map((o) => o.customerPhone)).size;

    res.json({
      items,
      orders: filteredOrders.length,
      users: uniquePhones,
      revenue,
      pendingMomo,
      pendingMomoCount,
      statsResetDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset dashboard stats timestamp
router.post("/reset", async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    settings.statsResetDate = new Date();
    await settings.save();
    res.json({
      success: true,
      message: "Dashboard stats reset successfully",
      statsResetDate: settings.statsResetDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
