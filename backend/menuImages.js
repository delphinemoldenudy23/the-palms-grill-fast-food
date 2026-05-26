// Unique image per menu item — name must match exactly
const MENU_IMAGES = {
  "Fried Rice with Chicken and Salad":
    "https://images.unsplash.com/photo-1603133872874-684f208fb614?w=600&auto=format&fit=crop",
  "Chicken Fried Rice":
    "https://images.unsplash.com/photo-1512058564366-0b37b0f693cf?w=600&auto=format&fit=crop",
  "Beef Fried Rice":
    "https://images.unsplash.com/photo-1585937421612-7a816d0f0000?w=600&auto=format&fit=crop",
  "Assorted Rice (Sausage & Gizzard)":
    "https://images.unsplash.com/photo-1609501671120-7a82e7c4f4f4?w=600&auto=format&fit=crop",
  "Yam with Fried Chicken Pepper and Ketchup":
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop",
  "Fried Yam and Shito":
    "https://images.unsplash.com/photo-1574481926449-ceca09fd3ecb?w=600&auto=format&fit=crop",
  "Fried Yam with BBQ Chicken (3 sticks)":
    "https://images.unsplash.com/photo-1527477396000-e27137b2a588?w=600&auto=format&fit=crop",
  "Fried Yam with BBQ Pork":
    "https://images.unsplash.com/photo-1432136556937-9ef5608c1973?w=600&auto=format&fit=crop",
  "Fried Yam with BBQ Chicken":
    "https://images.unsplash.com/photo-1598103442357-7949a74e0b7c?w=600&auto=format&fit=crop",
  "Fried Yam with Grilled Chicken Wings":
    "https://images.unsplash.com/photo-1608039751008-35a1a3b83f8a?w=600&auto=format&fit=crop",
};

const CATEGORY_FALLBACK = {
  "Rice Dishes":
    "https://images.unsplash.com/photo-1603133872874-684f208fb614?w=600&auto=format&fit=crop",
  "Yam Dishes":
    "https://images.unsplash.com/photo-1574481926449-ceca09fd3ecb?w=600&auto=format&fit=crop",
  "Special Orders":
    "https://images.unsplash.com/photo-1529042410759-befb1204b916?w=600&auto=format&fit=crop",
  Drinks:
    "https://images.unsplash.com/photo-1544145946-f90425340c7e?w=600&auto=format&fit=crop",
  Desserts:
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&auto=format&fit=crop",
};

function imageForItem(name, category) {
  return MENU_IMAGES[name] || CATEGORY_FALLBACK[category] || CATEGORY_FALLBACK["Rice Dishes"];
}

module.exports = { MENU_IMAGES, CATEGORY_FALLBACK, imageForItem };
