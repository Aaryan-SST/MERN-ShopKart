import { useState, useEffect } from "react";
import axios from "axios";
import { getProducts, getWishlist } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

const CATEGORIES = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

const SORT_OPTIONS = [
  { label: "Newest First", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function Products() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSort, setSelectedSort] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savedProductIds, setSavedProductIds] = useState(new Set());

  // Fetch wishlist once on mount to determine saved IDs
  useEffect(() => {
    let isMounted = true;

    const fetchWishlistIds = async () => {
      try {
        const res = await getWishlist();
        if (isMounted && res.data?.wishlist) {
          const ids = new Set(res.data.wishlist.map((item) => item._id || item));
          setSavedProductIds(ids);
        }
      } catch {
        // Fallback silently without breaking product browsing
      }
    };

    fetchWishlistIds();

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch products with AbortController guard against stale responses
  useEffect(() => {
    const controller = new AbortController();

    const fetchProductsData = async () => {
      setLoading(true);
      setError(false);

      try {
        const params = {};

        if (debouncedSearch && debouncedSearch.trim() !== "") {
          params.search = debouncedSearch.trim();
        }

        if (selectedCategory && selectedCategory !== "All Categories") {
          params.category = selectedCategory;
        }

        if (selectedSort && selectedSort !== "") {
          params.sort = selectedSort;
        }

        const res = await getProducts(params, { signal: controller.signal });

        if (!controller.signal.aborted) {
          setProducts(res.data.products || []);
        }
      } catch (err) {
        if (!axios.isCancel(err) && err.name !== "CanceledError") {
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProductsData();

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, selectedCategory, selectedSort]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Title & Description */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Product Catalog
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Explore our collection with search, category filtering, and sorting.
        </p>
      </div>

      {/* Controls: SearchBar, Category Dropdown, Sort Dropdown */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="flex-1">
          <SearchBar value={inputValue} onChange={setInputValue} />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-44 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="w-full sm:w-44 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* State View Rendering */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4" />
          <p className="text-gray-600 text-sm font-medium">Loading products...</p>
        </div>
      ) : error ? (
        <div className="py-16 px-4 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-md mx-auto">
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
          <p className="text-rose-700 text-sm font-medium">
            Something went wrong while loading products.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 px-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-center max-w-md mx-auto">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No products found.
          </h3>
          <p className="text-xs text-gray-500">
            Try adjusting your search terms or selecting a different category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isSaved={savedProductIds.has(product._id)}
              onSaved={(id) => setSavedProductIds((prev) => new Set(prev).add(id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
