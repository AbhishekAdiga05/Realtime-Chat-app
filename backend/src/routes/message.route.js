import express from "express";
const router = express.Router();
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  sendGroupMessage,
  searchMessages,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/search/:id", protectRoute, searchMessages);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/group/:id", protectRoute, sendGroupMessage);

export default router;
