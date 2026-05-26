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
  doc.image = resolveImageUrl(doc.image) || "";
  return doc;
}

const ALLOWED_UPDATE = ["name", "description", "category", "prices", "image", "available"];

// GET ALL MENU ITEMS
const getMenu = async (req, res) => {
  try {
    const menu = await MenuItem.find().sort({ createdAt: -1 });
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

    const item = await MenuItem.create({
      name,
      description,
      category,
      prices: normalizePrices(prices),
      image: storedImage || imageForItem(name, category),
      available: available !== false,
    });
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
    }

    const updated = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Item not found" });

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

    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { image },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Item not found" });

    res.json({
      message: "Image updated on customer website",
      item: formatMenuItem(updated),
    });
  } catch (error) {
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
