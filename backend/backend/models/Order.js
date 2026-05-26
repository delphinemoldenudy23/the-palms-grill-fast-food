const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
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
    enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
