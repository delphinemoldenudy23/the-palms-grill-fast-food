const mongoose = require("mongoose");
const MenuItem = require("./models/MenuItem");
const { MENU_IMAGES } = require("./menuImages");

mongoose.connect("mongodb://127.0.0.1:27017/palms-grill", {
  serverSelectionTimeoutMS: 5000,
});

const menuItems = [
  {
    name: "Fried Rice with Chicken and Salad",
    category: "Rice Dishes",
    description: "Classic fried rice served with chicken and fresh salad",
    prices: { M: 35, L: 50 },
    image: MENU_IMAGES["Fried Rice with Chicken and Salad"],
    available: true,
  },
  {
    name: "Chicken Fried Rice",
    category: "Rice Dishes",
    description: "Premium chicken fried rice — rich and flavorful",
    prices: { M: 65, L: 120 },
    image: MENU_IMAGES["Chicken Fried Rice"],
    available: true,
  },
  {
    name: "Beef Fried Rice",
    category: "Rice Dishes",
    description: "Savory beef fried rice cooked to perfection",
    prices: { M: 75, L: 125 },
    image: MENU_IMAGES["Beef Fried Rice"],
    available: true,
  },
  {
    name: "Assorted Rice (Sausage & Gizzard)",
    category: "Rice Dishes",
    description: "Hearty assorted rice with sausage and gizzard",
    prices: { Regular: 50 },
    image: MENU_IMAGES["Assorted Rice (Sausage & Gizzard)"],
    available: true,
  },
  {
    name: "Yam with Fried Chicken Pepper and Ketchup",
    category: "Yam Dishes",
    description: "Fried yam with seasoned chicken, pepper & ketchup",
    prices: { L: 60 },
    image: MENU_IMAGES["Yam with Fried Chicken Pepper and Ketchup"],
    available: true,
  },
  {
    name: "Fried Yam and Shito",
    category: "Yam Dishes",
    description: "Crispy fried yam with authentic Ghanaian shito",
    prices: { Regular: 30 },
    image: MENU_IMAGES["Fried Yam and Shito"],
    available: true,
  },
  {
    name: "Fried Yam with BBQ Chicken (3 sticks)",
    category: "Special Orders",
    description: "Fried yam with 3 sticks of BBQ chicken",
    prices: { Regular: 75 },
    image: MENU_IMAGES["Fried Yam with BBQ Chicken (3 sticks)"],
    available: true,
  },
  {
    name: "Fried Yam with BBQ Pork",
    category: "Special Orders",
    description: "Fried yam with BBQ pork — 3 or 6 sticks",
    prices: { "3 sticks": 75, "6 sticks": 120 },
    image: MENU_IMAGES["Fried Yam with BBQ Pork"],
    available: true,
  },
  {
    name: "Fried Yam with BBQ Chicken",
    category: "Special Orders",
    description: "Fried yam with BBQ chicken — medium or large portion",
    prices: { "3 sticks (M)": 75, "6 sticks (L)": 120 },
    image: MENU_IMAGES["Fried Yam with BBQ Chicken"],
    available: true,
  },
  {
    name: "Fried Yam with Grilled Chicken Wings",
    category: "Special Orders",
    description: "Fried yam with grilled chicken wings",
    prices: { M: 60, "6 sticks (L)": 120 },
    image: MENU_IMAGES["Fried Yam with Grilled Chicken Wings"],
    available: true,
  },
];

async function seedDB() {
  try {
    await MenuItem.deleteMany();
    await MenuItem.insertMany(menuItems);
    console.log(`Menu seeded: ${menuItems.length} items (each with its own image)`);
    mongoose.connection.close();
  } catch (error) {
    console.error("Seed failed:", error.message);
    console.error("Make sure MongoDB is running, then try again.");
    process.exit(1);
  }
}

seedDB();
