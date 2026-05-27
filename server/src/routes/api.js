import { Router } from "express";
import {
  chat,
  listModels,
  listConversations,
  getConversation,
  deleteConversation,
} from "../controllers/chatController.js";

const router = Router();

router.get("/models", listModels);
router.get("/conversations", listConversations);
router.get("/conversations/:id", getConversation);
router.delete("/conversations/:id", deleteConversation);
router.post("/chat", chat);

export default router;
