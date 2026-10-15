import mongoose from "mongoose";
import Product from "../models/product.model.js";

/**
 * Helper to escape regex special characters
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * POST /products
 * Create product
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (
      name === undefined ||
      description === undefined ||
      price === undefined ||
      category === undefined ||
      image === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, description, price, category, image, stock)",
      });
    }

    if (
      (typeof name === "string" && name.trim() === "") ||
      (typeof description === "string" && description.trim() === "") ||
      (typeof category === "string" && category.trim() === "") ||
      (typeof image === "string" && image.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Text fields cannot be empty",
      });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number strictly greater than 0",
      });
    }

    const numericStock = Number(stock);
    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number",
      });
    }

    const product = await Product.create({
      name: typeof name === "string" ? name.trim() : name,
      description: typeof description === "string" ? description.trim() : description,
      price: numericPrice,
      category: typeof category === "string" ? category.trim() : category,
      image: typeof image === "string" ? image.trim() : image,
      stock: numericStock,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error creating product",
    });
  }
};

/**
 * GET /products
 * List products with query params: search, category, sort
 * Projection: only _id, name, price, category, image, stock
 */
export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    if (search && typeof search === "string" && search.trim() !== "") {
      const escapedSearch = escapeRegex(search.trim());
      query.name = { $regex: escapedSearch, $options: "i" };
    }

    if (category && typeof category === "string" && category.trim() !== "") {
      const escapedCategory = escapeRegex(category.trim());
      query.category = { $regex: `^${escapedCategory}$`, $options: "i" };
    }

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };

    const sortOption = sortMap[sort] || { createdAt: -1 };

    const products = await Product.find(query)
      .select("_id name price category image stock")
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching products",
    });
  }
};

/**
 * GET /products/:id
 * Get single product with full document including description
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching product details",
    });
  }
};
