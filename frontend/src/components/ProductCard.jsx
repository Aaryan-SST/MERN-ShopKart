import { useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

// Inline SVG data URI fallback for broken images
const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f3f4f6'><rect width='400' height='300' fill='%23f3f4f6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'>Image Unavailable</text></svg>";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);
};

/**
 * AddToCartButton — connects ProductCard to CartContext.
 * Shows "Adding..." while pending, "Add Another" if in cart, "Add to Cart" if not.
 * Disabled when stock is 0 or when cart quantity equals stock.
 * Displays 400 stock error inline.
 */
export function AddToCartButton({ product }) {
  const { _id, stock } = product;
  const { addToCart, cartProductMap, pendingProducts } = useCart();
  const [stockError, setStockError] = useState("");

  const isPending = Boolean(pendingProducts[_id]);
  const currentQty = cartProductMap[_id] || 0;
  const isOutOfStock = (stock ?? 0) <= 0;
  const isMaxReached = currentQty >= (stock ?? 0);
  const isDisabled = isOutOfStock || isMaxReached || isPending;

  const handleAdd = async () => {
    if (isDisabled) return;
    setStockError("");
    const res = await addToCart(_id);
    if (!res.success) {
      setStockError(res.error || "Requested quantity exceeds available stock");
    }
  };

  let buttonText = "Add to Cart";
  if (isPending) {
    buttonText = "Adding...";
  } else if (isOutOfStock) {
    buttonText = "Out of Stock";
  } else if (isMaxReached) {
    buttonText = "Max in Cart";
  } else if (currentQty > 0) {
    buttonText = "Add Another";
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAdd}
        disabled={isDisabled}
        className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          isOutOfStock || isMaxReached
            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            : isPending
            ? "bg-indigo-400 text-white cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs focus:ring-indigo-500 cursor-pointer"
        }`}
      >
        {isPending ? (
          <span className="animate-spin text-sm leading-none">⏳</span>
        ) : (
          <span className="text-base leading-none">🛒</span>
        )}
        <span>{buttonText}</span>
      </button>

      {stockError && (
        <p className="text-xs text-rose-600 font-medium mt-1.5 text-center bg-rose-50 p-1 rounded border border-rose-200">
          {stockError}
        </p>
      )}
    </div>
  );
}

/**
 * WishlistButton — handles idle, pending, saved, and failed states for adding to wishlist.
 */
export function WishlistButton({ productId, isSaved: initialSaved = false, onSaved }) {
  const [localSaved, setLocalSaved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isSaved = initialSaved || localSaved;

  const handleAddToWishlist = async () => {
    if (isPending || isSaved) return;

    setIsPending(true);
    setErrorMessage("");

    try {
      await addToWishlist(productId);
      setLocalSaved(true);
      if (onSaved) onSaved(productId);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setLocalSaved(true);
        if (onSaved) onSaved(productId);
      } else {
        setErrorMessage(
          err.response?.data?.message || "Unable to save product. Please try again."
        );
      }
    } finally {
      setIsPending(false);
    }
  };

  const isFailed = Boolean(errorMessage) && !isSaved && !isPending;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAddToWishlist}
        disabled={isPending || isSaved}
        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          isSaved
            ? "bg-rose-50 text-rose-600 border-rose-200 cursor-default"
            : isPending
            ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-75"
            : isFailed
            ? "bg-white text-rose-600 border-rose-300 hover:bg-rose-50 focus:ring-rose-500 cursor-pointer"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 cursor-pointer"
        }`}
      >
        {isSaved ? (
          <>
            <span className="text-base leading-none text-rose-600">♥</span> Added to Wishlist
          </>
        ) : isPending ? (
          <>
            <span className="text-sm leading-none">⏳</span> Saving...
          </>
        ) : (
          <>
            <span className="text-base leading-none">♡</span> Add to Wishlist
          </>
        )}
      </button>
      {isFailed && (
        <p className="text-xs text-rose-600 font-medium mt-1.5 text-center">
          {errorMessage || "Unable to save product. Please try again."}
        </p>
      )}
    </div>
  );
}

export default function ProductCard({ product, actions, isSaved, onSaved }) {
  const { _id, name, price, category, image, stock } = product;

  // Render actions from prop, or fallback to AddToCartButton + WishlistButton
  const renderedActions =
    actions !== undefined ? (
      actions
    ) : (
      <div className="space-y-2">
        <AddToCartButton product={product} />
        {(isSaved !== undefined || onSaved !== undefined) && (
          <WishlistButton productId={_id} isSaved={isSaved} onSaved={onSaved} />
        )}
      </div>
    );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Image with fallback */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        <img
          src={image}
          alt={name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-0.5 rounded-md border border-gray-100 shadow-sm">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="font-semibold text-gray-900 text-base line-clamp-2 leading-snug mb-2"
            title={name}
          >
            {name}
          </h3>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            <span
              className={`text-xs font-medium ${
                stock > 0 ? "text-emerald-600" : "text-rose-600 font-semibold"
              }`}
            >
              {stock > 0 ? `${stock} units left` : "Out of stock"}
            </span>
          </div>
        </div>

        {/* Actions Slot + View Details */}
        <div className="pt-3 border-t border-gray-100 space-y-2 mt-2">
          {renderedActions && <div className="actions-slot">{renderedActions}</div>}

          <Link
            to={`/products/${_id}`}
            className="block w-full text-center py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
