const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  orderType: { type: String, enum: ["delivery", "pickup"], default: "delivery" },
  deliveryAddress: { type: String, default: "" },
  items: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  notes: { type: String, default: "" },
  paymentMethod: {
    type: String,
    enum: ["momo", "cash_on_delivery"],
    default: "momo",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  momoNumber: { type: String, default: "0551720664" },
  paymentReference: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
    default: "pending",
  },
  // Order tracking fields
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" }
  }],
  // Notification flags
  notifiedAdmin: { type: Boolean, default: false },
  notifiedCustomer: { type: Boolean, default: false },
  // Customer tracking support
  customerEmail: { type: String, default: "" },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: String, default: "" }, // "customer" or "admin"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamp before save
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Order", orderSchema);
