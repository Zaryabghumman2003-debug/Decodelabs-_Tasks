import { Router } from "express";
import { randomUUID } from "node:crypto";
import { readCollection, writeCollection } from "../data/store.js";
import { validateContactPayload } from "../validators/contact.validator.js";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { DB_PATHS } from "../data/paths.js";

const router = Router();

// POST /api/contact — public: submit a contact enquiry
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = validateContactPayload(req.body);
    const contacts = await readCollection(DB_PATHS.contacts);
    const record = { id: randomUUID(), ...payload, createdAt: new Date().toISOString() };
    contacts.push(record);
    await writeCollection(DB_PATHS.contacts, contacts);
    res.status(201).json({ data: record });
  })
);

// GET /api/contact — admin only: list submissions
router.get(
  "/",
  apiKeyAuth,
  asyncHandler(async (req, res) => {
    const contacts = await readCollection(DB_PATHS.contacts);
    res.status(200).json({ data: contacts, count: contacts.length });
  })
);

// GET /api/contact/:id — admin only
router.get(
  "/:id",
  apiKeyAuth,
  asyncHandler(async (req, res) => {
    const contacts = await readCollection(DB_PATHS.contacts);
    const record = contacts.find((c) => c.id === req.params.id);
    if (!record) throw new AppError(`Contact ${req.params.id} not found.`, 404);
    res.status(200).json({ data: record });
  })
);

export default router;
