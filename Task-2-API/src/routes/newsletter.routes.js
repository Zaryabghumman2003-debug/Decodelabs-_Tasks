import { Router } from "express";
import { randomUUID } from "node:crypto";
import { readCollection, writeCollection } from "../data/store.js";
import { validateNewsletterPayload } from "../validators/newsletter.validator.js";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { DB_PATHS } from "../data/paths.js";

const router = Router();

// POST /api/newsletter — public: subscribe an email
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { email } = validateNewsletterPayload(req.body);
    const subscribers = await readCollection(DB_PATHS.subscribers);
    if (subscribers.some((s) => s.email === email)) {
      throw new AppError("This email is already subscribed.", 409);
    }
    const record = { id: randomUUID(), email, createdAt: new Date().toISOString() };
    subscribers.push(record);
    await writeCollection(DB_PATHS.subscribers, subscribers);
    res.status(201).json({ data: record });
  })
);

// GET /api/newsletter — admin only: list subscribers
router.get(
  "/",
  apiKeyAuth,
  asyncHandler(async (req, res) => {
    const subscribers = await readCollection(DB_PATHS.subscribers);
    res.status(200).json({ data: subscribers, count: subscribers.length });
  })
);

export default router;
