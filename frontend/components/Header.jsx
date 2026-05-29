import { FaShoppingCart, FaUtensils, FaBox } from "react-icons/fa";
import { useRouter } from "next/router";

export default function Header({ cartCount, onCartClick }) {
  const router = useRouter();

  const goToMyOrders = () => {
    router.push("/my-orders");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-white font-bold text-lg">
          <FaUtensils className="text-primary" />
          <span className="hidden sm:inline">The Palm&apos;s Grill</span>
          <span className="sm:hidden">Palm&apos;s Grill</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <a href="#menu" className="hover:text-primary transition">Menu</a>
          <a href="#order" className="hover:text-primary transition">Order</a>
          <button onClick={goToMyOrders} className="hover:text-primary transition flex items-center gap-1">
            <FaBox />
            My Orders
          </button>
          <a href="#contact" className="hover:text-primary transition">Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToMyOrders}
            className="md:hidden relative flex items-center gap-1 text-gray-300 hover:text-primary px-3 py-2 rounded-lg transition"
            title="My Orders"
          >
            <FaBox />
          </button>
          <button
            type="button"
            onClick={onCartClick}
            className="relative flex items-center gap-2 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-xl font-semibold transition"
          >
            <FaShoppingCart />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
