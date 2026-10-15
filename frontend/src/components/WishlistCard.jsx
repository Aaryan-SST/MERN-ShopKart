import { useState } from "react";
import { Link } from "react-router-dom";
import { removeFromWishlist } from "../services/api";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f3f4f6'><rect width='400' height='300' fill='%23f3f4f6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'>Image Unavailable</text></svg>";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function WishlistCard({ product, onRemoveSuccess }) {
  const { _id, name, price, category, image, stock } = product;
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const handleRemove = async () => {
    if (isRemoving) return;

    setIsRemoving(true);
    setRemoveError("");

    try {
      await removeFromWishlist(_id);
      if (onRemoveSuccess) {
        onRemoveSuccess(_id);
      }
    } catch (err) {
      setIsRemoving(false);
      setRemoveError(
        err.response?.data?.message || "Failed to remove product. Please try again."
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Product Image */}
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

        {/* Actions: View Details and Remove from Wishlist */}
        <div className="pt-3 border-t border-gray-100 space-y-2 mt-2">
          <Link
            to={`/products/${_id}`}
            className="block w-full text-center py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            View Details
          </Link>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="w-full py-2 px-3 border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRemoving ? (
              <>
                <span className="animate-spin text-sm leading-none">⏳</span> Removing...
              </>
            ) : (
              <>
                <span>🗑️</span> Remove from Wishlist
              </>
            )}
          </button>

          {removeError && (
            <p className="text-xs text-rose-600 font-medium text-center">
              {removeError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
