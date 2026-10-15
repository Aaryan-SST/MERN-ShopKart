import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

/**
 * Check if the request attempts to supply a userId differing from req.user._id.
 * Reject with 403 if supplied and does not match req.user._id.
 */
const hasForbiddenUserId = (req, res) => {
  const providedUserId = req.body?.userId || req.query?.userId || req.params?.userId;
  if (providedUserId && providedUserId.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, message: "Access denied" });
    return true;
  }
  return false;
};

/**
 * Helper to fetch and build the populated cart response array.
 * Populates product details: name price category image stock.
 * Skips entries whose product is null (e.g. deleted from catalog).
 * Ensures item shape: { product: { _id, name, price, category, image, stock }, quantity }.
 */
export const getPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: "name price category image stock",
  });

  if (!customer || !customer.cart) {
    return [];
  }

  return customer.cart
    .filter((item) => item.product !== null && item.product !== undefined)
    .map((item) => ({
      product: {
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        category: item.product.category,
        image: item.product.image,
        stock: item.product.stock,
      },
      quantity: item.quantity,
    }));
};

/**
 * POST /cart/:productId
 * Adds a product with quantity 1, or increments the existing quantity by 1.
 */
export const addToCart = async (req, res) => {
  try {
    if (hasForbiddenUserId(req, res)) return;

    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const itemIndex = customer.cart.findIndex(
      (item) => item.product.equals(productId) || item.product.toString() === productId.toString()
    );

    const currentQuantity = itemIndex > -1 ? customer.cart[itemIndex].quantity : 0;
    const targetQuantity = currentQuantity + 1;

    if (product.stock === 0 || targetQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    if (itemIndex > -1) {
      customer.cart[itemIndex].quantity = targetQuantity;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    const populatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error adding product to cart",
    });
  }
};

/**
 * GET /cart
 * Returns the authenticated user's cart populated with product details.
 */
export const getCart = async (req, res) => {
  try {
    if (hasForbiddenUserId(req, res)) return;

    const populatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching cart",
    });
  }
};

/**
 * PATCH /cart/:productId
 * Takes { quantity } and updates the quantity in place.
 */
export const updateCartQuantity = async (req, res) => {
  try {
    if (hasForbiddenUserId(req, res)) return;

    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be an integer of at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const itemIndex = customer.cart.findIndex(
      (item) => item.product.equals(productId) || item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    // Update in-place to preserve cart ordering
    customer.cart[itemIndex].quantity = quantity;
    await customer.save();

    const populatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error updating cart",
    });
  }
};

/**
 * DELETE /cart/:productId
 * Removes an item from the cart. Works even if the product was deleted from the catalog.
 */
export const removeFromCart = async (req, res) => {
  try {
    if (hasForbiddenUserId(req, res)) return;

    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const itemIndex = customer.cart.findIndex(
      (item) => item.product.equals(productId) || item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    customer.cart.splice(itemIndex, 1);
    await customer.save();

    const populatedCart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error removing product from cart",
    });
  }
};
