import { Link, useNavigate } from "react-router-dom";
import { logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

/**
 * Navbar — brand name, navigation links and logout button.
 * Reads totalUnits from useCart to show "Cart (n)".
 * Logout redirects to /login in the `finally` block so it
 * always runs even when the request fails (e.g. expired session).
 */
export default function Navbar() {
  const navigate = useNavigate();
  const { totalUnits } = useCart();

  const navLinks = [
    { label: "Home", to: "/home" },
    { label: "Products", to: "/products" },
    { label: "Wishlist", to: "/wishlist" },
    { label: `Cart (${totalUnits})`, to: "/cart" },
  ];

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch {
      // Intentionally swallowed — redirect must happen regardless.
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <span className="text-xl font-bold tracking-wide select-none">
          🛒 ShopKart
        </span>

        {/* Links + Logout */}
        <div className="flex items-center gap-4 sm:gap-6">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-sm font-medium hover:text-indigo-200 transition-colors"
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="bg-white text-indigo-600 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
