import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

/**
 * POST /customers/register
 * @param {{ fullName: string, email: string, password: string, phone: string }} data
 */
export const registerCustomer = (data) => api.post("/customers/register", data);

/**
 * POST /customers/login
 * @param {{ email: string, password: string }} data
 */
export const loginCustomer = (data) => api.post("/customers/login", data);

/**
 * GET /customers/me — validates the HttpOnly cookie and returns user data.
 * Used by ProtectedRoute (guard) and public pages (logged-in redirect check).
 */
export const getMe = () => api.get("/customers/me");

/**
 * POST /customers/logout — clears the HttpOnly cookie on the server.
 * Redirect to /login must happen regardless of whether this call succeeds.
 */
export const logoutCustomer = () => api.post("/customers/logout");

/**
 * GET /products — list with optional search/category/sort query params
 * @param {{ search?: string, category?: string, sort?: string }} params
 * @param {import("axios").AxiosRequestConfig} [config]
 */
export const getProducts = (params = {}, config = {}) =>
  api.get("/products", { params, ...config });

/**
 * GET /products/:id — full product document
 * @param {string} id
 * @param {import("axios").AxiosRequestConfig} [config]
 */
export const getProductById = (id, config = {}) =>
  api.get(`/products/${id}`, config);

/**
 * POST /wishlist/:productId — adds product to customer's wishlist
 * @param {string} productId
 */
export const addToWishlist = (productId) =>
  api.post(`/wishlist/${productId}`);

/**
 * GET /wishlist — retrieves populated wishlist items for customer
 */
export const getWishlist = () =>
  api.get("/wishlist");

/**
 * DELETE /wishlist/:productId — removes product from customer's wishlist
 * @param {string} productId
 */
export const removeFromWishlist = (productId) =>
  api.delete(`/wishlist/${productId}`);

/**
 * GET /cart — retrieves populated cart for authenticated customer
 */
export const getCart = () =>
  api.get("/cart");

/**
 * POST /cart/:productId — adds product (quantity 1) or increments by 1
 * @param {string} productId
 */
export const addToCart = (productId) =>
  api.post(`/cart/${productId}`);

/**
 * PATCH /cart/:productId — updates cart item quantity in place
 * @param {string} productId
 * @param {number} quantity
 */
export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });

/**
 * DELETE /cart/:productId — removes item from cart
 * @param {string} productId
 */
export const removeFromCart = (productId) =>
  api.delete(`/cart/${productId}`);



