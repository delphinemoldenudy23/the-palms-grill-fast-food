const mongoose = require("mongoose");
const MenuItem = require("./models/MenuItem");
const { imageForItem } = require("./menuImages");

mongoose.connect("mongodb://127.0.0.1:27017/palms-grill", {
  serverSelectionTimeoutMS: 5000,
});

async function fix() {
  try {
    const items = await MenuItem.find();
    let updated = 0;

    for (const item of items) {
      const correctImage = imageForItem(item.name, item.category);
      if (item.image === correctImage) continue;

      item.image = correctImage;
      await item.save();
      updated++;
      console.log(`✓ ${item.name}`);
    }

    console.log(`\nDone: ${updated} of ${items.length} items now have matching images`);
    mongoose.connection.close();
  } catch (err) {
    console.error("Fix failed:", err.message);
    console.error("Make sure MongoDB is running.");
    process.exit(1);
  }
}

fix();
