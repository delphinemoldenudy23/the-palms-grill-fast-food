/**
 * Reset admin password if you forgot it.
 * Run: node resetAdmin.js
 * Default after reset: admin@palmsgrill.com / admin123
 */
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

const EMAIL = "admin@palmsgrill.com";
const NEW_PASSWORD = "admin123";

mongoose.connect("mongodb://127.0.0.1:27017/palms-grill");

async function reset() {
  try {
    const admin = await Admin.findOne({ email: EMAIL });
    if (!admin) {
      console.log("No admin found. Run: node seedAdmin.js");
      process.exit(1);
    }
    admin.password = NEW_PASSWORD;
    await admin.save();
    console.log(`Password reset for ${EMAIL}`);
    console.log(`Login with: ${EMAIL} / ${NEW_PASSWORD}`);
    mongoose.connection.close();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

reset();
