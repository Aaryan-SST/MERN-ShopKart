import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);
};

export default function Cart() {
  const {
    cartItems,
    cartLoading,
    cartError,
    totalUnits,
    subtotal,
    hasStockDrift,
    refreshCart,
  } = useCart();

  // Loading State
  if (cartLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4" />
        <p className="text-gray-600 text-sm font-medium">Loading your cart...</p>
      </div>
    );
  }

  // Error State
  if (cartError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unable to load your cart.
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {typeof cartError === "string"
              ? cartError
              : "Something went wrong while fetching your cart items. Please try again."}
          </p>
          <button
            type="button"
            onClick={refreshCart}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-sm">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty 🛒
          </h2>
          <p className="text-gray-600 text-sm mb-8">
            Looks like you haven’t added anything yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="mb-6 sm:mb-8 flex items-baseline justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          My Cart
        </h1>
        <span className="text-sm font-medium text-gray-500">
          {totalUnits} {totalUnits === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Stock Drift Warning Banner if any item exceeds stock */}
      {hasStockDrift && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-amber-900">
              Stock availability warning
            </h4>
            <p className="text-amber-800 text-xs sm:text-sm mt-0.5">
              One or more items in your cart exceed available stock. Please adjust
              quantities to proceed with checkout.
            </p>
          </div>
        </div>
      )}

      {/* Responsive Grid: Item list on left, Order Summary on right (desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="divide-y divide-gray-100">
            {cartItems.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between">
            <Link
              to="/products"
              className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-4 pb-3 border-b border-gray-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Items ({totalUnits} units):</span>
              <span className="font-medium text-gray-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span>Delivery:</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between text-base">
              <span className="font-bold text-gray-900">Subtotal:</span>
              <span className="text-xl font-extrabold text-indigo-600">
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              disabled={hasStockDrift}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>

            {hasStockDrift && (
              <p className="text-xs text-amber-700 text-center font-medium">
                Adjust quantities exceeding available stock to checkout.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
