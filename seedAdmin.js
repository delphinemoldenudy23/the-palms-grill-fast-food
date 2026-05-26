require("dotenv").config();

const mongoose = require("mongoose");
const Admin = require("./models/Admin");

const RESET = process.argv.includes("--reset");

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
});

async function seedAdmin() {
  try {
    const existing = await Admin.findOne({ email: "admin@palmsgrill.com" });

    if (existing) {
      if (RESET) {
        existing.password = "admin123";
        await existing.save();
        console.log("Admin password reset to: admin123");
      } else {
        console.log("Admin already exists (use: node seedAdmin.js --reset to restore admin123)");
      }
      mongoose.connection.close();
      return;
    }

    await Admin.create({
      username: "admin",
      email: "admin@palmsgrill.com",
      password: "admin123",
    });

    console.log("Admin created: admin@palmsgrill.com / admin123");

    mongoose.connection.close();
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

seedAdmin();