import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

// signup route
router.post("/signup", signup);

// login route
router.post("/login", login);

// logout  route
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;
