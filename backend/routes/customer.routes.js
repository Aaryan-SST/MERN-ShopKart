import express from "express";
import { register, login, getMe, logout, changePassword } from "../controllers/customer.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);
router.patch("/change-password", authMiddleware, changePassword);

export default router;
