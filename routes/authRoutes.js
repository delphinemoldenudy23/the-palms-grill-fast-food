const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "palms-grill-secret-key";

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CURRENT ADMIN PROFILE
router.get("/me", protect, async (req, res) => {
  res.json(req.admin);
});

// UPDATE EMAIL / USERNAME
router.put("/profile", protect, async (req, res) => {
  try {
    const { email, username } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (email && email !== admin.email) {
      const taken = await Admin.findOne({ email });
      if (taken) return res.status(400).json({ message: "Email already in use" });
      admin.email = email;
    }

    if (username && username !== admin.username) {
      const taken = await Admin.findOne({ username });
      if (taken) return res.status(400).json({ message: "Username already in use" });
      admin.username = username;
    }

    await admin.save();
    res.json({
      message: "Profile updated",
      username: admin.username,
      email: admin.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHANGE PASSWORD
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const admin = await Admin.findById(req.admin._id);
    const matches = await admin.matchPassword(currentPassword);

    if (!matches) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE ANOTHER ADMIN (logged-in admin only)
router.post("/create-admin", protect, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await Admin.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ message: "Email or username already exists" });
    }

    const newAdmin = await Admin.create({
      username,
      email,
      password,
      role: role || "Admin",
    });

    res.status(201).json({
      message: "Admin account created",
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LIST ALL ADMINS (logged-in only)
router.get("/admins", protect, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
