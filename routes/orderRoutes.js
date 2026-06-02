const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { MOMO_NUMBER } = require("../config/payment");
const { protect } = require("../middleware/authMiddleware");

// Generate unique order ID
function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

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
      orderId: generateOrderId(),
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
    const { phone, name, orderId } = req.query;
    
    // If no filter parameters provided, return all orders (for admin)
    if (!phone && !name && !orderId) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    }
    
    // Build filter based on provided parameters
    const filter = {};
    if (phone) filter.customerPhone = phone;
    if (name) filter.customerName = { $regex: name, $options: "i" };
    if (orderId) filter.orderId = orderId;
    
    const orders = await Order.find(filter).sort({ createdAt: -1 });
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

router.delete("/:id", async (req, res) => {
  try {
    const { customerPhone, deletedBy } = req.body;
    
    // Find the order first
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    // Verify customer phone if deleted by customer
    if (deletedBy === "customer" && order.customerPhone !== customerPhone) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own orders" });
    }
    
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset all stats (admin only)
router.delete("/reset-all", async (req, res) => {
  try {
    const result = await Order.deleteMany({});
    res.json({
      success: true,
      message: `Reset ${result.deletedCount} orders successfully`
    });
  } catch (err) {
    console.error("Error resetting orders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to reset orders"
    });
  }
});

module.exports = router;
