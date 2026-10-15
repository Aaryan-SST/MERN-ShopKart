import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600' fill='%23f3f4f6'><rect width='600' height='600' fill='%23f3f4f6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'>Image Unavailable</text></svg>";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);
};

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cartActionError, setCartActionError] = useState("");

  const { addToCart, cartProductMap, pendingProducts } = useCart();


  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setNotFound(false);

    getProductById(id)
      .then((res) => {
        if (isMounted) {
          setProduct(res.data.product);
          setLoading(false);
        }
      })
      .catch((_err) => {
        if (isMounted) {
          // Both 400 and 404 (and other errors) render the friendly Product not found state
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4" />
        <p className="text-gray-600 text-sm font-medium">Loading product details...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product not found
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            The product you are looking for might have been removed, had its ID changed, or does not exist.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const isPending = Boolean(pendingProducts[product._id]);
  const currentQty = cartProductMap[product._id] || 0;
  const isMaxReached = currentQty >= (product.stock ?? 0);
  const isAddDisabled = isOutOfStock || isMaxReached || isPending;

  const handleAddToCart = async () => {
    if (isAddDisabled) return;
    setCartActionError("");
    const res = await addToCart(product._id);
    if (!res.success) {
      setCartActionError(res.error || "Requested quantity exceeds available stock");
    }
  };

  let buttonText = "Add to Cart";
  if (isPending) {
    buttonText = "Adding...";
  } else if (isOutOfStock) {
    buttonText = "Sold Out";
  } else if (isMaxReached) {
    buttonText = "Max in Cart";
  } else if (currentQty > 0) {
    buttonText = "Add Another";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb back navigation */}
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to all products
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-10">
          {/* Large Image Container */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
              className="w-full h-full object-cover object-center"
            />
            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-xs font-semibold text-gray-800 px-3 py-1 rounded-full border border-gray-200 shadow-sm">
              {product.category}
            </span>
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    !isOutOfStock
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {!isOutOfStock ? `${product.stock} units in stock` : "Out of stock"}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  About this product
                </h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Actions: Add to Cart */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddDisabled}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                  isAddDisabled
                    ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
                }`}
              >
                {isPending ? (
                  <span className="animate-spin text-sm leading-none">⏳</span>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                )}
                <span>{buttonText}</span>
              </button>

              {cartActionError && (
                <p className="text-xs text-rose-600 text-center font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {cartActionError}
                </p>
              )}

              {isOutOfStock && !cartActionError && (
                <p className="text-xs text-rose-600 text-center font-medium">
                  This item is currently out of stock and cannot be added to cart.
                </p>
              )}

              {isMaxReached && !isOutOfStock && !cartActionError && (
                <p className="text-xs text-gray-500 text-center font-medium">
                  You have added all available units ({product.stock}) to your cart.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
