import { Router, Request, Response, NextFunction } from "express";
import { generateStylistReply } from "../services/ai.service";
import { AIChatMessage } from "../types";

const router = Router();

const MAX_HISTORY_TURNS = 12;
const MAX_MESSAGE_LENGTH = 1000;

/**
 * POST /api/ai/chat
 * Body: { message: string, history: AIChatMessage[] }
 */
router.post("/chat", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, history } = req.body as {
      message?: string;
      history?: AIChatMessage[];
    };

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required." });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: "message is too long." });
    }

    const trimmedHistory = Array.isArray(history)
      ? history.slice(-MAX_HISTORY_TURNS)
      : [];

    const result = await generateStylistReply(trimmedHistory, message);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
