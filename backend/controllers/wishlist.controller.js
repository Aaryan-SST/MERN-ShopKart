import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

/**
 * Check if the request attempts to supply a userId differing from req.user._id
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
 * POST /wishlist/:productId
 * Adds a product to the authenticated customer's wishlist.
 */
export const addToWishlist = async (req, res) => {
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

    const alreadyExists = customer.wishlist.some(
      (id) => id.equals(productId) || id.toString() === productId.toString()
    );

    if (alreadyExists) {
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error adding product to wishlist",
    });
  }
};

/**
 * GET /wishlist
 * Returns populated wishlist items for the authenticated customer.
 */
export const getWishlist = async (req, res) => {
  try {
    if (hasForbiddenUserId(req, res)) return;

    const customer = await Customer.findById(req.user._id)
      .populate({
        path: "wishlist",
        select: "name price category image stock",
      })
      .lean();

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // Filter out null entries left by products deleted from the catalog
    const validWishlist = (customer.wishlist || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error fetching wishlist",
    });
  }
};

/**
 * DELETE /wishlist/:productId
 * Removes a product from the authenticated customer's wishlist.
 */
export const removeFromWishlist = async (req, res) => {
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

    const itemIndex = customer.wishlist.findIndex(
      (id) => id.equals(productId) || id.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in wishlist" });
    }

    customer.wishlist.splice(itemIndex, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error removing product from wishlist",
    });
  }
};
