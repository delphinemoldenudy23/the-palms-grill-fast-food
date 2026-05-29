const MenuItem = require("../models/MenuItem");
const { resolveImageUrl, normalizeStoredImage } = require("../lib/imageUrl");
const { imageForItem } = require("../menuImages");

function normalizePrices(prices) {
  if (!prices || typeof prices !== "object") return {};
  if (prices instanceof Map) {
    return Object.fromEntries(prices.entries());
  }
  return { ...prices };
}

function formatMenuItem(item) {
  const doc = item.toObject ? item.toObject() : item;
  doc.prices = normalizePrices(doc.prices);
  
  // Only resolve image URL if it exists, otherwise return empty string
  // No fallback - let frontend handle missing images
  if (doc.image) {
    doc.image = resolveImageUrl(doc.image);
  } else {
    doc.image = "";
  }
  
  // Log for debugging
  if (process.env.NODE_ENV !== "production") {
    console.log("Menu item image:", {
      name: doc.name,
      originalImage: item.image,
      finalImage: doc.image
    });
  }
  
  return doc;
}

const ALLOWED_UPDATE = ["name", "description", "category", "prices", "image", "available"];

// GET ALL MENU ITEMS
const getMenu = async (req, res) => {
  try {
    const menu = await MenuItem.find().sort({ createdAt: -1 });
    
    // Log for debugging
    if (process.env.NODE_ENV !== "production") {
      console.log("Fetching menu items:", menu.length, "items");
      menu.forEach(item => {
        console.log(`  - ${item.name}: image = ${item.image}`);
      });
    }
    
    res.json(menu.map(formatMenuItem));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE MENU ITEM
const createMenuItem = async (req, res) => {
  try {
    const { name, description, category, prices, image, available } = req.body;
    const storedImage = normalizeStoredImage(image);

    // Log for debugging
    if (process.env.NODE_ENV !== "production") {
      console.log("Creating menu item with image:", {
        name,
        incomingImage: image,
        storedImage
      });
    }

    const item = await MenuItem.create({
      name,
      description,
      category,
      prices: normalizePrices(prices),
      image: storedImage || null,
      available: available !== false,
    });
    
    // Log saved item
    if (process.env.NODE_ENV !== "production") {
      console.log("Menu item created with image:", {
        id: item._id,
        name: item.name,
        savedImage: item.image
      });
    }
    
    res.status(201).json(formatMenuItem(item));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE MENU ITEM (full or partial)
const updateMenuItem = async (req, res) => {
  try {
    const updates = {};
    for (const key of ALLOWED_UPDATE) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.prices) updates.prices = normalizePrices(updates.prices);
    if (updates.image !== undefined) {
      updates.image = normalizeStoredImage(updates.image);
      
      // Log for debugging
      if (process.env.NODE_ENV !== "production") {
        console.log("Updating menu item image:", {
          id: req.params.id,
          incomingImage: req.body.image,
          normalizedImage: updates.image
        });
      }
    }

    const updated = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Item not found" });

    // Log saved image
    if (process.env.NODE_ENV !== "production" && updates.image !== undefined) {
      console.log("Menu item updated with image:", {
        id: updated._id,
        name: updated.name,
        savedImage: updated.image
      });
    }

    res.json(formatMenuItem(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE IMAGE ONLY (admin photo change → customer site)
const updateMenuImage = async (req, res) => {
  try {
    const image = normalizeStoredImage(req.body.image);
    if (!image) {
      return res.status(400).json({ message: "Image URL or upload path is required" });
    }

    // Log for debugging
    if (process.env.NODE_ENV !== "production") {
      console.log("Updating menu image:", {
        id: req.params.id,
        incomingImage: req.body.image,
        normalizedImage: image
      });
    }

    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { image },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Item not found" });

    // Log the saved image
    if (process.env.NODE_ENV !== "production") {
      console.log("Menu image saved to database:", {
        id: updated._id,
        name: updated.name,
        savedImage: updated.image
      });
    }

    res.json({
      message: "Image updated on customer website",
      item: formatMenuItem(updated),
    });
  } catch (error) {
    console.error("Error updating menu image:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE MENU ITEM
const deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMenu,
  createMenuItem,
  updateMenuItem,
  updateMenuImage,
  deleteMenuItem,
};
