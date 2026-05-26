require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const os = require("os");

const app = express();

// CORS
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : "*";

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const statsRoutes = require("./routes/statsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/payment", paymentRoutes);

// Get local IP (kept for local development only)
function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

// ENV
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";
const MONGODB_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/palms-grill";

// Connect DB + start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);

      if (process.env.NODE_ENV !== "production") {
        const ip = getLocalIp();
        console.log(`Local: http://localhost:${PORT}`);
        console.log(`Network: http://${ip}:${PORT}`);
        console.log(`Share customer: http://${ip}:3000`);
        console.log(`Share admin: http://${ip}:3001`);
      }
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
  });