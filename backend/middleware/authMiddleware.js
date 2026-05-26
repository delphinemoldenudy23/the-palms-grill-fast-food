const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const JWT_SECRET = process.env.JWT_SECRET || "palms-grill-secret-key";

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized — please log in again" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin account not found" });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired — please log in again" });
  }
};

module.exports = { protect };
