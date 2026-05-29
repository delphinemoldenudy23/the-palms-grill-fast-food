import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import OrderTracking from "../components/OrderTracking";
import { FaBox, FaTrash, FaArrowLeft } from "react-icons/fa";

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [searchType, setSearchType] = useState("orderId"); // phone, name, orderId
  const [authenticated, setAuthenticated] = useState(false);

  const fetchOrders = async (phone) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/orders?phone=${encodeURIComponent(phone)}`);
      setOrders(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Could not load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    // Validation based on search type
    if (searchType === "orderId") {
      if (!orderId.trim() || !customerPhone.trim()) {
        setError("Please enter both Order ID and Phone Number for verification");
        return;
      }
    } else if (searchType === "phone") {
      if (!customerPhone.trim() || !customerName.trim()) {
        setError("Please enter both Phone Number and Name for verification");
        return;
      }
    } else if (searchType === "name") {
      if (!customerName.trim() || !customerPhone.trim()) {
        setError("Please enter both Name and Phone Number for verification");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");
      
      // Build query with verification parameters
      let url = `/api/orders/verify?`;
      if (searchType === "orderId") {
        url += `orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(customerPhone)}`;
      } else {
        url += `phone=${encodeURIComponent(customerPhone)}&name=${encodeURIComponent(customerName)}`;
      }
      
      const res = await api.get(url);
      
      if (res.data.success === false) {
        setError(res.data.message || "Details do not match any order. Please check and try again.");
        setAuthenticated(false);
        setOrders([]);
      } else {
        setOrders(res.data.orders || []);
        setAuthenticated(true);
        setCustomerPhone(customerPhone); // Store for delete functionality
        
        if (res.data.orders.length === 0) {
          setError("No orders found matching your details");
        }
      }
    } catch (err) {
      console.error("Error searching orders:", err);
      setError("Could not verify your details. Please try again.");
      setAuthenticated(false);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchType("orderId");
    setOrders([]);
    setAuthenticated(false);
    setError("");
    setCustomerPhone("");
    setCustomerName("");
    setOrderId("");
  };

  const deleteOrder = async (orderMongoId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    if (!customerPhone) {
      alert("Your session has expired. Please verify your details again.");
      handleReset();
      return;
    }

    try {
      const response = await api.delete(`/api/orders/${orderMongoId}`, {
        data: { customerPhone, deletedBy: "customer" }
      });
      
      if (response.data.message === "Order deleted successfully") {
        setOrders(orders.filter((o) => o._id !== orderMongoId));
        alert("Order deleted successfully");
      } else {
        alert("Could not delete order: " + (response.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      const errorMessage = err.response?.data?.message || err.message || "Could not delete order. Please try again.";
      alert("Could not delete order: " + errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-2"
          >
            <FaArrowLeft />
            <span>Back to Menu</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">
            Track your orders in real-time
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {!authenticated ? (
          /* Authentication Form */
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Find Your Orders</h2>
            <p className="text-gray-500 mb-6">
              Enter your details to verify and view your orders
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Method
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5"
                >
                  <option value="orderId">Order ID + Phone</option>
                  <option value="phone">Phone + Name</option>
                  <option value="name">Name + Phone</option>
                </select>
              </div>
              
              {searchType === "orderId" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order ID *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your order ID (e.g., ORD-XXX)"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the phone number used for the order"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                </>
              )}
              
              {(searchType === "phone" || searchType === "name") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the phone number used for the order"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the name used for the order"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border rounded-xl px-4 py-2.5"
                    />
                  </div>
                </>
              )}
              
              <button
                onClick={handleSearch}
                className="w-full btn-primary px-6 py-3 rounded-xl font-semibold"
              >
                Verify & View Orders
              </button>
            </div>
          </div>
        ) : (
          /* Orders Display */
          <>
            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-gray-900">Search Orders</h2>
                <button
                  onClick={handleReset}
                  className="text-sm text-primary hover:underline"
                >
                  Search Different Order
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="border rounded-xl px-4 py-2.5"
                >
                  <option value="phone">Phone Number</option>
                  <option value="name">Customer Name</option>
                  <option value="orderId">Order ID</option>
                </select>
                <input
                  type="text"
                  placeholder={
                    searchType === "phone"
                      ? "Enter phone number"
                      : searchType === "name"
                      ? "Enter customer name"
                      : "Enter order ID"
                  }
                  value={searchType === "orderId" ? orderId : searchType === "name" ? customerName : customerPhone}
                  onChange={(e) => {
                    if (searchType === "orderId") setOrderId(e.target.value);
                    else if (searchType === "name") setCustomerName(e.target.value);
                    else setCustomerPhone(e.target.value);
                  }}
                  className="flex-1 border rounded-xl px-4 py-2.5"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="btn-primary px-6 py-2.5 rounded-xl font-semibold"
                >
                  Search
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h2>
                <p className="text-gray-500 mb-4">No orders match your search criteria.</p>
                <button
                  onClick={handleReset}
                  className="btn-primary px-6 py-2 rounded-lg font-semibold"
                >
                  Search Again
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order #{order.orderId || order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.customerName} · {order.customerPhone}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          GH¢{order.totalAmount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="px-6 py-4">
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
                        <ul className="space-y-1">
                          {order.items.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 flex justify-between">
                              <span>
                                {item.name} ({item.size}) x{item.quantity}
                              </span>
                              <span>GH¢{(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {order.deliveryAddress && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-700 mb-1">Delivery Address</h3>
                          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                        </div>
                      )}

                      {order.notes && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-700 mb-1">Notes</h3>
                          <p className="text-sm text-gray-600">{order.notes}</p>
                        </div>
                      )}

                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-700 mb-1">Payment</h3>
                        <p className="text-sm text-gray-600">
                          {order.paymentMethod === "momo"
                            ? `MoMo (${order.momoNumber})`
                            : "Cash on Delivery"}
                          {" · "}
                          <span
                            className={
                              order.paymentStatus === "paid"
                                ? "text-green-600 font-semibold"
                                : "text-amber-600 font-semibold"
                            }
                          >
                            {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Order Tracking */}
                    <div className="px-6 py-4 bg-gray-50 border-t">
                      <h3 className="font-semibold text-gray-700 mb-3">Order Status</h3>
                      <OrderTracking order={order} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
