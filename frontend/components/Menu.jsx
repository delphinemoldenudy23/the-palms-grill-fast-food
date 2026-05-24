import { useEffect, useState } from "react";
import { FaPlus, FaShoppingCart } from "react-icons/fa";
import { api } from "../lib/api";
import FoodImage from "./FoodImage";
import { withFallback } from "../lib/imageUrl";

const CATEGORIES = ["All", "Rice Dishes", "Yam Dishes", "Special Orders"];

function getPrices(item) {
  if (!item.prices) return [];
  if (item.prices instanceof Map) {
    return Array.from(item.prices.entries());
  }
  return Object.entries(item.prices);
}

export default function Menu({ addToCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadMenu = () => {
    setLoading(true);
    api
      .get(`/api/menu?_=${Date.now()}`)
      .then((res) => {
        setLoadError("");

        // ✅ FIXED SAFETY CHECK (IMPORTANT)
        const data = Array.isArray(res.data)
          ? res.data.filter((i) => i.available !== false)
          : [];

        setMenuItems(data);
      })
      .catch(() => {
        setLoadError(
          "Cannot load menu. Start the backend: cd backend → npm run dev"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMenu();
    const onFocus = () => loadMenu();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const filtered =
    category === "All"
      ? menuItems
      : menuItems.filter((i) => i.category === category);

  const handleAdd = (item, size, price) => {
    addToCart({
      menuId: item._id,
      name: item.name,
      size,
      price: Number(price),
      quantity: 1,
      image: withFallback(item.image),
      category: item.category,
    });
  };

  return (
    <section id="menu" className="py-20 px-4 bg-[#fafafa]">
      <div className="max-w-6xl mx-auto">
        <h2 className="section-title">Our Menu</h2>
        <p className="section-sub">
          Fresh rice dishes, yam specials &amp; BBQ — tap a size, then add to cart
        </p>

        <div className="text-center mb-6">
          <button
            type="button"
            onClick={loadMenu}
            className="text-sm text-primary font-semibold hover:underline"
          >
            Refresh menu
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                category === cat
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-orange-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading menu...</p>
        ) : loadError ? (
          <p className="text-center text-red-600 py-12">{loadError}</p>
        ) : menuItems.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            Menu is empty. In the backend folder run:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">node seedMenu.js</code>
            , then refresh this page.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No items in this category. Try &quot;All&quot; or another filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const prices = getPrices(item);

              return (
                <article key={item._id} className="food-card flex flex-col">
                  <div className="relative h-48 w-full bg-gray-100">
                    <FoodImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-dark/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-dark mb-1">{item.name}</h3>

                    {item.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4 flex-1">
                      {prices.map(([size, price]) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleAdd(item, size, price)}
                          className="w-full flex justify-between items-center border border-gray-200 hover:border-primary hover:bg-orange-50 rounded-xl px-4 py-2.5 transition group"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {size}
                          </span>
                          <span className="flex items-center gap-2 text-primary font-bold">
                            GH¢{price}
                            <FaPlus className="text-xs opacity-0 group-hover:opacity-100 transition" />
                          </span>
                        </button>
                      ))}
                    </div>

                    {prices.length === 1 && (
                      <button
                        type="button"
                        onClick={() => handleAdd(item, prices[0][0], prices[0][1])}
                        className="w-full bg-primary hover:bg-secondary text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <FaShoppingCart /> Add to Cart
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}