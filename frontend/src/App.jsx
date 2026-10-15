import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";

/**
 * Route map:
 *  /              → Navigate to /home
 *  /login         → Login (public)
 *  /register      → Register (public)
 *  /home          → Home (protected, inside ProtectedRoute layout)
 *  /products      → Products catalog (protected, inside ProtectedRoute layout)
 *  /products/:id  → Product details (protected, inside ProtectedRoute layout)
 *  /wishlist      → Customer wishlist (protected, inside ProtectedRoute layout)
 *  /cart          → Cart page (protected, inside ProtectedRoute layout)
 *  *              → Navigate to /login (catch-all for unknown paths)
 */
export default function App() {
  return (
    <Routes>
      {/* Root → /home */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected layout — Navbar persists across all child routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
      </Route>

      {/* Catch-all → /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
