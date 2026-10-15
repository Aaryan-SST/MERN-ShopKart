import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [pendingProducts, setPendingProducts] = useState({});

  // Helper to mark a product as pending
  const setProductPending = useCallback((productId, isPending) => {
    setPendingProducts((prev) => {
      if (isPending) {
        return { ...prev, [productId]: true };
      } else {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
    });
  }, []);

  // Fetch populated cart from backend
  const refreshCart = useCallback(async () => {
    setCartLoading(true);
    setCartError(null);
    try {
      const res = await getCart();
      setCartItems(res.data?.cart || []);
    } catch (err) {
      setCartError(err.response?.data?.message || "Unable to load your cart.");
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Add product to cart (or increment by 1)
  const addToCart = useCallback(
    async (productId) => {
      setProductPending(productId, true);
      try {
        const res = await apiAddToCart(productId);
        if (res.data?.cart) {
          setCartItems(res.data.cart);
        }
        return { success: true, cart: res.data?.cart };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to add product to cart.";
        return { success: false, error: message };
      } finally {
        setProductPending(productId, false);
      }
    },
    [setProductPending]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity < 1) return { success: false, error: "Quantity must be at least 1" };
      setProductPending(productId, true);
      try {
        const res = await apiUpdateCartQuantity(productId, quantity);
        if (res.data?.cart) {
          setCartItems(res.data.cart);
        }
        return { success: true, cart: res.data?.cart };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to update quantity.";
        return { success: false, error: message };
      } finally {
        setProductPending(productId, false);
      }
    },
    [setProductPending]
  );

  // Remove item from cart
  const removeFromCart = useCallback(
    async (productId) => {
      setProductPending(productId, true);
      try {
        const res = await apiRemoveFromCart(productId);
        if (res.data?.cart) {
          setCartItems(res.data.cart);
        }
        return { success: true, cart: res.data?.cart };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to remove product from cart.";
        return { success: false, error: message };
      } finally {
        setProductPending(productId, false);
      }
    },
    [setProductPending]
  );

  // Derived values computed via useMemo (never stored in state)
  // Skip rows whose product is null defensively
  const validCartItems = useMemo(() => {
    return cartItems.filter((item) => item && item.product);
  }, [cartItems]);

  const totalUnits = useMemo(() => {
    return validCartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }, [validCartItems]);

  const subtotal = useMemo(() => {
    return validCartItems.reduce(
      (acc, item) => acc + (item.product.price || 0) * (item.quantity || 0),
      0
    );
  }, [validCartItems]);

  // Check if any cart item exceeds available stock
  const hasStockDrift = useMemo(() => {
    return validCartItems.some(
      (item) => item.quantity > (item.product.stock ?? 0)
    );
  }, [validCartItems]);

  // Fast lookup map for quantity of each product in the cart
  const cartProductMap = useMemo(() => {
    const map = {};
    for (const item of validCartItems) {
      if (item.product?._id) {
        map[item.product._id] = item.quantity;
      }
    }
    return map;
  }, [validCartItems]);

  const value = useMemo(
    () => ({
      cartItems: validCartItems,
      cartLoading,
      cartError,
      pendingProducts,
      totalUnits,
      subtotal,
      hasStockDrift,
      cartProductMap,
      addToCart,
      updateQuantity,
      removeFromCart,
      refreshCart,
    }),
    [
      validCartItems,
      cartLoading,
      cartError,
      pendingProducts,
      totalUnits,
      subtotal,
      hasStockDrift,
      cartProductMap,
      addToCart,
      updateQuantity,
      removeFromCart,
      refreshCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default CartContext;
