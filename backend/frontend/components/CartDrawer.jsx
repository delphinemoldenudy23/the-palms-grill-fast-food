import { useState } from "react";
import { FaTimes, FaTrash, FaWhatsapp, FaCopy, FaMobileAlt } from "react-icons/fa";
import { buildWhatsAppUrl } from "../lib/whatsapp";
import { api } from "../lib/api";
import { MOMO_NUMBER, MOMO_LABEL } from "../lib/payment";
import FoodImage from "./FoodImage";

export default function CartDrawer({
  open,
  onClose,
  cart,
  setCart,
  customer,
  setCustomer,
  orderType,
  setOrderType,
  notes,
  setNotes,
  onOrderSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [paymentReference, setPaymentReference] = useState("");
  const [copied, setCopied] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const updateQty = (index, delta) => {
    setCart(
      cart
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const copyMomo = async () => {
    try {
      await navigator.clipboard.writeText(MOMO_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`MoMo number: ${MOMO_NUMBER}`);
    }
  };

  const placeOrder = async () => {
    if (!cart.length) return alert("Your cart is empty");
    if (!customer.name?.trim() || !customer.phone?.trim()) {
      return alert("Please enter your name and phone number");
    }
    if (orderType === "delivery" && !customer.address?.trim()) {
      return alert("Please enter your delivery address");
    }
    if (paymentMethod === "momo" && !paymentReference.trim()) {
      return alert(
        `Please send GH¢${total.toFixed(2)} to MoMo ${MOMO_NUMBER}, then enter your transaction ID / reference.`
      );
    }

    setSubmitting(true);
    try {
      await api.post("/api/orders", {
        customer,
        items: cart,
        total,
        orderType,
        notes,
        paymentMethod,
        paymentReference: paymentMethod === "momo" ? paymentReference : "",
      });

      setCart([]);
      setCustomer({ name: "", phone: "", address: "" });
      setNotes("");
      setPaymentReference("");
      onOrderSuccess();
      onClose();
      alert(
        paymentMethod === "momo"
          ? `Order placed! We will confirm your MoMo payment (${MOMO_NUMBER}) shortly.`
          : "Order placed! Pay when you receive your order."
      );
    } catch {
      alert(
        "Order could not be saved. Make sure the backend is running and you are on the same Wi‑Fi network."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const sendWhatsApp = () => {
    if (!cart.length) return alert("Add items to your cart first");
    if (!customer.name?.trim() || !customer.phone?.trim()) {
      return alert("Enter your name and phone first");
    }
    const url = buildWhatsAppUrl(cart, customer, orderType, notes);
    window.open(url, "_blank");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold">Your Order ({itemCount})</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Cart is empty. Add items from the menu.</p>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.menuId}-${item.size}-${index}`} className="flex gap-3 border-b pb-4">
                <FoodImage
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.size}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateQty(index, -1)}
                      className="w-7 h-7 rounded-lg border font-bold"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(index, 1)}
                      className="w-7 h-7 rounded-lg border font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    GH¢{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 mt-2 text-sm"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}

          {cart.length > 0 && (
            <div id="order" className="space-y-3 pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType("delivery")}
                  className={`flex-1 py-2 rounded-xl font-semibold text-sm ${
                    orderType === "delivery" ? "bg-primary text-white" : "bg-gray-100"
                  }`}
                >
                  Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  className={`flex-1 py-2 rounded-xl font-semibold text-sm ${
                    orderType === "pickup" ? "bg-primary text-white" : "bg-gray-100"
                  }`}
                >
                  Pickup
                </button>
              </div>

              <input
                name="name"
                placeholder="Full Name *"
                value={customer.name}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5"
              />
              <input
                name="phone"
                placeholder="Phone *"
                value={customer.phone}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-2.5"
              />
              {orderType === "delivery" && (
                <textarea
                  name="address"
                  placeholder="Delivery Address *"
                  value={customer.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-xl px-4 py-2.5"
                />
              )}
              <input
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5"
              />

              <div className="rounded-xl border-2 border-yellow-400 bg-yellow-50 p-4 space-y-3">
                <p className="font-bold text-gray-900 flex items-center gap-2">
                  <FaMobileAlt className="text-yellow-600" /> Payment
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("momo")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                      paymentMethod === "momo"
                        ? "bg-yellow-500 text-white"
                        : "bg-white border"
                    }`}
                  >
                    MoMo Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                      paymentMethod === "cash_on_delivery"
                        ? "bg-gray-800 text-white"
                        : "bg-white border"
                    }`}
                  >
                    Pay on delivery
                  </button>
                </div>

                {paymentMethod === "momo" && (
                  <>
                    <div className="bg-white rounded-lg p-3 border border-yellow-300">
                      <p className="text-xs text-gray-600 mb-1">{MOMO_LABEL}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-2xl font-bold text-gray-900 tracking-wide">
                          {MOMO_NUMBER}
                        </span>
                        <button
                          type="button"
                          onClick={copyMomo}
                          className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                        >
                          <FaCopy /> {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">
                        1. Send <strong>GH¢{total.toFixed(2)}</strong> to this MoMo number
                        <br />
                        2. Enter your transaction ID below
                        <br />
                        3. Tap Place Order
                      </p>
                    </div>
                    <input
                      placeholder="MoMo Transaction ID / Reference *"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full border rounded-xl px-4 py-2.5 bg-white"
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t bg-gray-50 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">GH¢{total.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              disabled={submitting}
              className="w-full btn-primary disabled:opacity-60"
            >
              {submitting ? "Placing order..." : "Place Order"}
            </button>

            <button
              type="button"
              onClick={sendWhatsApp}
              className="w-full border-2 border-green-500 text-green-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-50 transition"
            >
              <FaWhatsapp /> Chat on WhatsApp (optional)
            </button>

            <p className="text-xs text-gray-500 text-center">
              MoMo payments appear in admin. Mark paid after you receive the money.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
