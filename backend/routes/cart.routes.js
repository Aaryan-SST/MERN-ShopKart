import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// All cart endpoints are protected and rely strictly on req.user
router.use(authMiddleware);

router.post("/:productId", addToCart);
router.get("/", getCart);
router.patch("/:productId", updateCartQuantity);
router.delete("/:productId", removeFromCart);

export default router;
