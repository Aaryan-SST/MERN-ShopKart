import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f3f4f6'><rect width='400' height='300' fill='%23f3f4f6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'>Image Unavailable</text></svg>";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);
};

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart, pendingProducts } = useCart();
  const { product, quantity } = item;

  if (!product) return null;

  const isPending = Boolean(pendingProducts[product._id]);
  const isAtMin = quantity <= 1;
  const isAtMax = quantity >= (product.stock ?? 0);
  const isOverStock = quantity > (product.stock ?? 0);
  const lineTotal = (product.price || 0) * quantity;

  const handleDecrement = () => {
    if (isAtMin || isPending) return;
    updateQuantity(product._id, quantity - 1);
  };

  const handleIncrement = () => {
    if (isAtMax || isPending) return;
    updateQuantity(product._id, quantity + 1);
  };

  const handleRemove = () => {
    if (isPending) return;
    removeFromCart(product._id);
  };

  return (
    <div
      className={`py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 last:border-b-0 transition-opacity ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <span className="inline-block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
            {product.category}
          </span>
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug truncate">
            <Link
              to={`/products/${product._id}`}
              className="hover:text-indigo-600 transition-colors"
            >
              {product.name}
            </Link>
          </h4>

          <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {formatPrice(product.price)}
            </span>
            <span>•</span>
            <span
              className={
                product.stock > 0 ? "text-gray-500" : "text-rose-600 font-semibold"
              }
            >
              {product.stock > 0
                ? `${product.stock} in stock`
                : "Out of stock"}
            </span>
          </div>

          {/* Stock Drift Warning */}
          {isOverStock && (
            <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
              <span>⚠️</span>
              <span>
                Quantity exceeds available stock ({product.stock} available)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls: Quantity [-] qty [+] | Line Total | Remove Button */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        {/* Quantity Controls */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xs">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isAtMin || isPending}
            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-base font-bold transition-colors focus:outline-none focus:bg-gray-100"
            title={isAtMin ? "Quantity cannot be less than 1. Use Remove to delete." : "Decrease quantity"}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold text-gray-900 select-none">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isAtMax || isPending}
            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-base font-bold transition-colors focus:outline-none focus:bg-gray-100"
            title={isAtMax ? "Maximum available stock reached" : "Increase quantity"}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Line Total */}
        <div className="w-24 text-right">
          <span className="text-sm font-bold text-gray-900 sm:text-base">
            {formatPrice(lineTotal)}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="text-xs font-medium text-rose-600 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          title="Remove item from cart"
          aria-label="Remove item"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span className="hidden sm:inline">Remove</span>
        </button>
      </div>
    </div>
  );
}
