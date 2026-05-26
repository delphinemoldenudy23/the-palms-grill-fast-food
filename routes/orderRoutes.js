const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { MOMO_NUMBER } = require("../config/payment");

router.post("/", async (req, res) => {
  try {
    const { customer, items, total, orderType, notes, paymentMethod, paymentReference } =
      req.body;

    if (!customer?.name || !customer?.phone) {
      return res.status(400).json({ message: "Missing customer details" });
    }

    const type = orderType || "delivery";
    if (type === "delivery" && !customer?.address?.trim()) {
      return res.status(400).json({ message: "Delivery address required" });
    }

    if (!items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const method = paymentMethod === "cash_on_delivery" ? "cash_on_delivery" : "momo";

    const order = new Order({
      customerName: customer.name,
      customerPhone: customer.phone,
      orderType: type,
      deliveryAddress: customer.address || "",
      items,
      totalAmount: total,
      notes: notes || "",
      paymentMethod: method,
      paymentStatus: "pending",
      momoNumber: method === "momo" ? MOMO_NUMBER : "",
      paymentReference: paymentReference?.trim() || "",
    });

    const saved = await order.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: saved,
    });
  } catch (err) {
    console.log("ORDER ERROR:", err);
    res.status(500).json({ success: false, message: "Order failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch orders" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.paymentStatus) updates.paymentStatus = req.body.paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
