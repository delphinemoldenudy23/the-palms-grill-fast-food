import Head from "next/head";
import { useState } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Menu from "../components/Menu";
import CartDrawer from "../components/CartDrawer";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import WhatsAppFloat from "../components/WhatsAppFloat";

export default function Home() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderType, setOrderType] = useState("delivery");
  const [notes, setNotes] = useState("");
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });

  const addToCart = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (c) => c.menuId === item.menuId && c.size === item.size
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, item];
    });
    setCartOpen(true);
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (orderDone) {
    return (
      <>
        <Head>
          <title>Order Confirmed | The Palm&apos;s Grill</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
          <div className="text-center max-w-md bg-white p-10 rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
            <p className="text-gray-600 mb-6">
              Your order was saved. WhatsApp should have opened — we&apos;ll confirm shortly.
            </p>
            <button
              type="button"
              onClick={() => setOrderDone(false)}
              className="btn-primary"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>The Palm&apos;s Grill &amp; Fast Food | Best Restaurant In Town</title>
        <meta
          name="description"
          content="Order fried rice, yam dishes & special BBQ online. Delivery available Osu Kuku Hill."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <Hero />
      <Features />
      <Menu addToCart={addToCart} />
      <Contact />
      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        setCart={setCart}
        customer={customer}
        setCustomer={setCustomer}
        orderType={orderType}
        setOrderType={setOrderType}
        notes={notes}
        setNotes={setNotes}
        onOrderSuccess={() => setOrderDone(true)}
      />

      <WhatsAppFloat />
    </>
  );
}
