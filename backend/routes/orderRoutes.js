const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { MOMO_NUMBER } = require("../config/payment");

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
      customerEmail: customer.email || "",
      orderType: type,
      deliveryAddress: customer.address || "",
      items,
      totalAmount: total,
      notes: notes || "",
      paymentMethod: method,
      paymentStatus: "pending",
      momoNumber: method === "momo" ? MOMO_NUMBER : "",
      paymentReference: paymentReference?.trim() || "",
      status: "pending",
      statusHistory: [{ status: "pending", timestamp: new Date(), note: "Order placed" }],
      notifiedAdmin: false,
      notifiedCustomer: false,
    });

    const saved = await order.save();

    // Emit Socket.IO event for new order
    const io = req.app.get("io");
    if (io) {
      io.to("admin").emit("new-order", saved);
      console.log("🔔 New order emitted to admin room");
    }

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
    const orders = await Order.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch orders" });
  }
});

// Get orders by customer phone
router.get("/customer/:phone", async (req, res) => {
  try {
    const orders = await Order.find({ 
      customerPhone: req.params.phone, 
      isDeleted: false 
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch customer orders" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updates = {};
    if (req.body.status) {
      updates.status = req.body.status;
      // Add to status history
      const order = await Order.findById(req.params.id);
      if (order) {
        updates.statusHistory = [
          ...(order.statusHistory || []),
          { 
            status: req.body.status, 
            timestamp: new Date(), 
            note: req.body.note || "" 
          }
        ];
      }
    }
    if (req.body.paymentStatus) updates.paymentStatus = req.body.paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

    // Emit Socket.IO event for status update
    const io = req.app.get("io");
    if (io) {
      // Notify customer
      io.to(`customer-${updatedOrder.customerPhone}`).emit("order-updated", updatedOrder);
      console.log(`📤 Order update emitted to customer ${updatedOrder.customerPhone}`);
      
      // Notify admin
      io.to("admin").emit("order-updated", updatedOrder);
      console.log("📤 Order update emitted to admin room");
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Soft delete order (customer can delete their own orders)
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if customer is deleting their own order
    if (req.body.customerPhone && order.customerPhone !== req.body.customerPhone) {
      return res.status(403).json({ message: "You can only delete your own orders" });
    }

    order.isDeleted = true;
    order.deletedAt = new Date();
    order.deletedBy = req.body.deletedBy || "customer";
    await order.save();

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify customer details before granting access to orders
router.get("/verify", async (req, res) => {
  try {
    const { orderId, phone, name } = req.query;
    
    console.log("Verification request:", { orderId, phone, name });
    
    // Require at least phone and either orderId or name
    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Phone number is required for verification" 
      });
    }
    
    if (!orderId && !name) {
      return res.status(400).json({ 
        success: false, 
        message: "Either Order ID or Name is required for verification" 
      });
    }
    
    let orders = [];
    
    if (orderId) {
      // Verify by Order ID + Phone
      console.log("Searching for order with orderId:", orderId, "and phone:", phone);
      const order = await Order.findOne({ 
        orderId: orderId, 
        customerPhone: phone,
        isDeleted: false 
      });
      
      console.log("Found order:", order ? "Yes" : "No");
      
      if (!order) {
        return res.status(401).json({ 
          success: false, 
          message: "Order ID and phone number do not match any order" 
        });
      }
      
      orders = [order];
    } else {
      // Verify by Phone + Name
      console.log("Searching for orders with phone:", phone, "and name:", name);
      orders = await Order.find({ 
        customerPhone: phone, 
        customerName: { $regex: name, $options: "i" },
        isDeleted: false 
      }).sort({ createdAt: -1 });
      
      console.log("Found orders:", orders.length);
      
      if (orders.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: "Phone number and name do not match any order" 
        });
      }
    }
    
    console.log("Verification successful, returning", orders.length, "orders");
    res.json({ 
      success: true, 
      orders,
      message: "Verification successful" 
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Verification failed. Please try again." 
    });
  }
});

// Clear all orders (admin only)
router.delete("/clear-all", async (req, res) => {
  try {
    console.log("Clearing all orders...");
    const result = await Order.deleteMany({});
    console.log("Deleted", result.deletedCount, "orders");
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} orders successfully`
    });
  } catch (err) {
    console.error("Error clearing orders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to clear orders"
    });
  }
});

module.exports = router;
