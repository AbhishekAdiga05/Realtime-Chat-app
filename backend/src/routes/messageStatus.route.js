import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  markMessagesAsSeen,
  getMessageStatus,
} from "../controllers/messageStatus.controller.js";

const router = express.Router();

router.post("/seen", protectRoute, markMessagesAsSeen);
router.get("/status/:messageId", protectRoute, getMessageStatus);

export default router;
