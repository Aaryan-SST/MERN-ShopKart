import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getMe } from "../services/api";
import { CartProvider } from "../context/CartContext";
import Navbar from "./Navbar";

/**
 * ProtectedRoute — layout route that guards all authenticated pages.
 *
 * Flow:
 *  1. On mount → calls GET /customers/me
 *  2. Pending  → full-screen loading spinner
 *  3. 200 OK   → renders <CartProvider><Navbar /> + <Outlet context={{ user }} /></CartProvider>
 *  4. Any error → <Navigate to="/login" replace />
 *
 * Persists across protected pages so Navbar stays mounted.
 * CartProvider is mounted inside the authenticated layout, so it fetches
 * once after authentication succeeds and unmounts on logout (resetting cart).
 */
export default function ProtectedRoute() {
  const [user, setUser] = useState(null);
  // "pending" | "ok" | "denied"
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    getMe()
      .then((res) => {
        setUser(res.data);
        setStatus("ok");
      })
      .catch(() => {
        setStatus("denied");
      });
  }, []);

  if (status === "pending") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Outlet context={{ user }} />
      </div>
    </CartProvider>
  );
}
