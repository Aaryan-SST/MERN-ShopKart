import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getWishlist } from "../services/api";
import WishlistCard from "../components/WishlistCard";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getWishlist();
      setWishlist(res.data?.wishlist || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getWishlist()
      .then((res) => {
        if (isMounted) {
          setWishlist(res.data?.wishlist || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveSuccess = (removedId) => {
    setWishlist((prevList) => prevList.filter((item) => item._id !== removedId));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          My Wishlist
        </h1>
        {!loading && !error && (
          <p className="text-sm text-gray-600 mt-1">
            {wishlist.length} {wishlist.length === 1 ? "product saved" : "products saved"}
          </p>
        )}
      </div>

      {/* State rendering */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4" />
          <p className="text-gray-600 text-sm font-medium">Loading your wishlist...</p>
        </div>
      ) : error ? (
        <div className="py-16 px-6 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-md mx-auto">
          <svg
            className="w-10 h-10 text-rose-500 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-rose-700 text-sm font-medium mb-4">
            Something went wrong. We couldn’t load your wishlist.
          </p>
          <button
            type="button"
            onClick={loadWishlist}
            className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            Try Again
          </button>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="py-20 px-6 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-center max-w-md mx-auto">
          <div className="text-4xl mb-3">💖</div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Explore our catalog and save items you want to keep track of.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemoveSuccess={handleRemoveSuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}
