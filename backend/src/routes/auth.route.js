import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
  getUserById,
  blockUser,
  unblockUser,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

router.get("/users/:id", protectRoute, getUserById);

router.put("/block/:id", protectRoute, blockUser);

router.put("/unblock/:id", protectRoute, unblockUser);

export default router;
