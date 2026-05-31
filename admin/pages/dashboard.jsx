import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  FaBoxes,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCog,
  FaMobileAlt,
} from "react-icons/fa";
import SettingsPanel from "../components/SettingsPanel";
import ImageUpload from "../components/ImageUpload";
import FoodImage from "../components/FoodImage";
import NotificationBell from "../components/NotificationBell";
import { formatPrices, pricesToForm } from "../lib/menuHelpers";
import { normalizeStoredImage } from "../lib/imageUrl";
import { initAdminSocket } from "../lib/socket";

import { getAPIUrl, authHeaders } from "../lib/api";

const apiClient = axios.create({
  timeout: 180000, // 3 minutes timeout for image uploads
});
apiClient.interceptors.request.use((config) => {
  config.baseURL = getAPIUrl();
  const headers = authHeaders();
  config.headers = { ...config.headers, ...headers };
  return config;
});

export default function Dashboard() {
  const [tab, setTab] = useState("menu");
  const [stats, setStats] = useState({
    items: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    pendingMomo: 0,
    pendingMomoCount: 0,
  });
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false);
  const [newOrderData, setNewOrderData] = useState(null);
  const [showClearStatsModal, setShowClearStatsModal] = useState(false);
  const [clearPassword, setClearPassword] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Rice Dishes",
    priceSmall: "",
    priceLarge: "",
    priceSingle: "",
    image: "",
    imageUrl: "",
    available: true,
  });

  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) router.push("/login");
    else {
      fetchStats();
      fetchMenu();
      fetchOrders();
      // Initialize Socket.IO connection
      initAdminSocket();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/api/stats");
      setStats(res.data);
    } catch (e) {
      console.error(e);
      setStats((s) => ({ ...s, items: menuItems.length }));
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await apiClient.get("/api/menu");
      setMenuItems(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const res = await apiClient.get("/api/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setOrders([]);
      setOrdersError(
        "Cannot load orders. Is the backend running on port 5000? Restart it after saving orderRoutes.js."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const openOrdersTab = () => {
    setTab("orders");
    fetchOrders();
    fetchStats();
  };

  const handleNewOrder = (order) => {
    fetchOrders();
    fetchStats();
    setNewOrderData(order);
    setShowNewOrderPopup(true);
    if (tab !== "orders") {
      setTab("orders");
    }
  };

  const handleChange = (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const buildPrices = () => {
    const prices = {};
    if (form.priceSmall) prices.M = Number(form.priceSmall);
    if (form.priceLarge) prices.L = Number(form.priceLarge);
    if (!form.priceSmall && !form.priceLarge && form.priceSingle) {
      prices.Regular = Number(form.priceSingle);
    }
    return prices;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prices = buildPrices();
    if (!Object.keys(prices).length) {
      return alert("Add at least one price");
    }

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      prices,
      image: normalizeStoredImage(form.image),
      available: form.available,
    };

    try {
      if (editingId) {
        await apiClient.put(`/api/menu/${editingId}`, payload);
        alert("Updated! Customers will see this on the website.");
      } else {
        await apiClient.post("/api/menu", payload);
        alert("Added! Item is now on the customer website (if Available is checked).");
      }
      resetForm();
      await fetchMenu();
      await fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Could not save item. Is the backend running?");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "Rice Dishes",
      priceSmall: "",
      priceLarge: "",
      priceSingle: "",
      image: "",
      imageUrl: "",
      available: true,
    });
    setEditingId(null);
    // Clear any file input to prevent image reuse
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    const priceFields = pricesToForm(item.prices);
    setForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "Rice Dishes",
      ...priceFields,
      image: normalizeStoredImage(item.image) || item.image || "",
      imageUrl:
        item.image && String(item.image).startsWith("http") ? item.image : "",
      available: item.available !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUrlPaste = async () => {
    const url = form.imageUrl?.trim();
    if (!url) return alert("Paste an image link first (https://...)");
    const stored = normalizeStoredImage(url);
    setForm((f) => ({ ...f, image: stored, imageUrl: url }));

    if (editingId) {
      try {
        await apiClient.patch(`/api/menu/${editingId}/image`, { image: stored });
        alert("Image updated on customer website! Refresh the customer page.");
        fetchMenu();
      } catch (err) {
        alert(err.response?.data?.message || "Could not save image");
      }
    } else {
      alert("Image link set — click Add Item to publish.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await apiClient.delete(`/api/menu/${id}`);
    fetchMenu();
    fetchStats();
  };

  const toggleAvailable = async (item) => {
    await apiClient.put(`/api/menu/${item._id}`, {
      available: item.available === false,
    });
    fetchMenu();
  };

  const updateOrderStatus = async (id, status) => {
    await apiClient.patch(`/api/orders/${id}`, { status });
    fetchOrders();
    fetchStats();
  };

  const markMomoPaid = async (id) => {
    await apiClient.patch(`/api/orders/${id}`, { paymentStatus: "paid" });
    fetchOrders();
    fetchStats();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleClearStats = async () => {
    if (clearPassword !== "admin") {
      alert("Incorrect password.");
      return;
    }

    if (!confirm("Are you sure you want to clear all orders, customers, and revenue data? This action cannot be undone.")) {
      return;
    }

    try {
      await apiClient.delete("/api/orders/clear-all");
      fetchOrders();
      fetchStats();
      setShowClearStatsModal(false);
      setClearPassword("");
      alert("All stats cleared successfully.");
    } catch (err) {
      console.error("Error clearing stats:", err);
      alert("Failed to clear stats. Please try again.");
    }
  };

  const menuCount = stats.items ?? menuItems.length;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-dark text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">The Palm&apos;s Grill Admin</h1>
        <div className="flex items-center gap-4">
          <NotificationBell onNewOrder={handleNewOrder} />
          <button onClick={handleLogout} className="bg-primary px-4 py-2 rounded-lg">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard icon={<FaBoxes />} label="Menu Items" value={menuCount} color="text-orange-500" />
          <StatCard icon={<FaShoppingCart />} label="Orders" value={stats.orders ?? orders.length} color="text-green-500" />
          <StatCard icon={<FaUsers />} label="Customers" value={stats.users ?? 0} color="text-blue-500" />
          <StatCard icon={<FaChartBar />} label="Revenue (paid)" value={`GH¢${Number(stats.revenue || 0).toLocaleString()}`} color="text-purple-500" />
          <StatCard icon={<FaMobileAlt />} label="MoMo pending" value={stats.pendingMomoCount ?? 0} color="text-yellow-600" />
          <StatCard icon={<FaChartBar />} label="Awaiting MoMo" value={`GH¢${Number(stats.pendingMomo || 0).toLocaleString()}`} color="text-amber-600" />
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("menu")}
            className={`px-5 py-2 rounded-lg font-semibold capitalize ${
              tab === "menu" ? "bg-primary text-white" : "bg-white"
            }`}
          >
            menu
          </button>
          <button
            onClick={openOrdersTab}
            className={`px-5 py-2 rounded-lg font-semibold capitalize ${
              tab === "orders" ? "bg-primary text-white" : "bg-white"
            }`}
          >
            orders ({stats.orders || orders.length})
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`px-5 py-2 rounded-lg font-semibold flex items-center gap-2 ${
              tab === "settings" ? "bg-primary text-white" : "bg-white"
            }`}
          >
            <FaCog /> settings
          </button>
          <button
            onClick={() => setShowClearStatsModal(true)}
            className="px-5 py-2 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600"
          >
            Clear Stats
          </button>
        </div>

        {tab === "menu" && (
          <>
            <div className="bg-white p-6 rounded-2xl shadow mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingId ? "Edit Menu Item" : "Add Menu Item"}
                </h3>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-semibold"
                  >
                    + New Item
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                <input name="name" placeholder="Food Name *" value={form.name} onChange={handleChange} className="border p-3 rounded-lg" required />
                <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border p-3 rounded-lg" />
                <select name="category" value={form.category} onChange={handleChange} className="border p-3 rounded-lg">
                  <option>Rice Dishes</option>
                  <option>Yam Dishes</option>
                  <option>Special Orders</option>
                  <option>Drinks</option>
                  <option>Desserts</option>
                </select>
                <ImageUpload
                  value={form.image}
                  editingItemId={editingId}
                  onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                  onImageSaved={() => {
                    fetchMenu();
                    // Only refresh the form if we're still editing the same item
                    if (editingId) {
                      const updatedItem = menuItems.find(item => item._id === editingId);
                      if (updatedItem) {
                        setForm((f) => ({ ...f, image: updatedItem.image }));
                      }
                    }
                  }}
                />
                <div className="md:col-span-2 flex flex-wrap gap-2 items-center">
                  <input
                    name="imageUrl"
                    placeholder="Or paste image link (https://...)"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className="border p-3 rounded-lg flex-1 min-w-[200px]"
                  />
                  <button
                    type="button"
                    onClick={handleImageUrlPaste}
                    className="bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold whitespace-nowrap"
                  >
                    {editingId ? "Save image to website" : "Use this link"}
                  </button>
                </div>
                <input type="number" name="priceSmall" placeholder="M / Small price" value={form.priceSmall} onChange={handleChange} className="border p-3 rounded-lg" />
                <input type="number" name="priceLarge" placeholder="L / Large price" value={form.priceLarge} onChange={handleChange} className="border p-3 rounded-lg" />
                <input type="number" name="priceSingle" placeholder="Single price (if no M/L)" value={form.priceSingle || ""} onChange={handleChange} className="border p-3 rounded-lg" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
                  Available on website
                </label>
                <div className="md:col-span-2 flex gap-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold"
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className={`${editingId ? "flex-1" : "md:col-span-2"} bg-primary text-white py-3 rounded-lg font-bold`}>
                    {editingId ? "Update Item" : "Add Item"}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-xl font-bold mb-4">Menu Items</h3>
              {menuItems.map((item) => (
                <div key={item._id} className="flex flex-wrap justify-between gap-4 border-b py-4">
                  <div className="flex gap-4">
                    <FoodImage
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-100"
                    />
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="text-orange-600 text-sm">{formatPrices(item.prices)}</p>
                    <span className={`text-xs ${item.available !== false ? "text-green-600" : "text-red-500"}`}>
                      {item.available !== false ? "Available" : "Hidden"}
                    </span>
                  </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleAvailable(item)} className="bg-gray-200 px-3 py-2 rounded-lg">
                      {item.available !== false ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button onClick={() => handleEdit(item)} className="bg-blue-500 text-white px-3 py-2 rounded-lg"><FaEdit /></button>
                    <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white px-3 py-2 rounded-lg"><FaTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "orders" && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Customer Orders</h3>
              <button
                type="button"
                onClick={fetchOrders}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold"
              >
                Refresh
              </button>
            </div>
            {ordersError && (
              <p className="text-red-600 bg-red-50 p-4 rounded-lg mb-4">{ordersError}</p>
            )}
            {ordersLoading ? (
              <p className="text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">
                No orders yet. Place a test order on the website (Place Order button), then click Refresh.
              </p>
            ) : (
              orders.map((o) => (
                <div key={o._id} className="border-b py-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-bold">Order #{o.orderId || o._id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{o.customerName} · {o.customerPhone}</p>
                      <p className="text-sm text-gray-500">
                        {o.orderType || "delivery"} · {new Date(o.createdAt).toLocaleString()}
                      </p>
                      {o.deliveryAddress && <p className="text-sm">{o.deliveryAddress}</p>}
                      <p className="text-primary font-bold mt-1">GH¢{o.totalAmount}</p>
                      <p className="text-sm mt-1">
                        <span className="font-semibold">Payment:</span>{" "}
                        {o.paymentMethod === "momo" ? `MoMo ${o.momoNumber || "0551720664"}` : "Pay on delivery"}
                        {" · "}
                        <span className={o.paymentStatus === "paid" ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                          {o.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </span>
                      </p>
                      {o.paymentReference && (
                        <p className="text-xs text-gray-500">Ref: {o.paymentReference}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                    {o.paymentMethod === "momo" && o.paymentStatus !== "paid" && (
                      <button
                        type="button"
                        onClick={() => markMomoPaid(o._id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 rounded-lg font-semibold whitespace-nowrap"
                      >
                        Mark MoMo paid
                      </button>
                    )}
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                      className="border rounded-lg px-3 py-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    </div>
                  </div>
                  <ul className="mt-2 text-sm text-gray-600">
                    {(o.items || []).map((it, i) => (
                      <li key={i}>
                        {it.name} ({it.size}) x{it.quantity || 1}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "settings" && <SettingsPanel />}

        {/* New Order Popup */}
        {showNewOrderPopup && newOrderData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <FaShoppingCart className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">New Order Received!</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-900">
                  Order #{newOrderData.orderId || newOrderData._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm text-gray-600">{newOrderData.customerName}</p>
                <p className="text-sm text-gray-600">{newOrderData.customerPhone}</p>
                <p className="text-lg font-bold text-primary mt-2">GH¢{newOrderData.totalAmount}</p>
              </div>
              <button
                onClick={() => setShowNewOrderPopup(false)}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90"
              >
                View Order
              </button>
            </div>
          </div>
        )}

        {/* Clear Stats Modal */}
        {showClearStatsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <FaTrash className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Clear All Stats</h3>
              </div>
              <p className="text-gray-600 mb-4">
                This will permanently delete all orders. This action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter password to confirm
                </label>
                <input
                  type="password"
                  value={clearPassword}
                  onChange={(e) => setClearPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full border rounded-lg px-4 py-3"
                  onKeyPress={(e) => e.key === "Enter" && handleClearStats()}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowClearStatsModal(false);
                    setClearPassword("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearStats}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
                >
                  Clear Stats
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <div className={`text-3xl mb-2 ${color}`}>{icon}</div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
