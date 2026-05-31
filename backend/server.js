const dotenv = require("dotenv");
dotenv.config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const os = require("os");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
      : "*",
    methods: ["GET", "POST"],
  },
});

// Make io accessible to routes
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("join-admin", () => {
    socket.join("admin");
    console.log("👤 Admin joined admin room");
  });

  socket.on("join-customer", (phone) => {
    socket.join(`customer-${phone}`);
    console.log(`👤 Customer ${phone} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// CORS
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : "*";

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  console.log("➡️ REQUEST:", req.method, req.url);
  next();
});

/* 
🚫 LOCAL UPLOADS REMOVED
Cloudinary will handle all image hosting
*/
// (removed express.static /uploads completely)

// Routes
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const statsRoutes = require("./routes/statsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// API routes
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/payment", paymentRoutes);

// Get local IP
function getLocalIp() {
  const nets = os.networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }

  return "localhost";
}

// ENV
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

const MONGODB_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/palms-grill";

// Connect MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log(`Socket.IO ready for real-time updates`);

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

module.exports = { io };