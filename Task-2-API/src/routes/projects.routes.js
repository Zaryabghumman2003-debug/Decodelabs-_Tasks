import { Router } from "express";
import { randomUUID } from "node:crypto";
import { readCollection, writeCollection } from "../data/store.js";
import { validateProjectPayload } from "../validators/project.validator.js";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { DB_PATHS } from "../data/paths.js";

const router = Router();

// GET /api/projects — public: list studio work
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const projects = await readCollection(DB_PATHS.projects);
    res.status(200).json({ data: projects, count: projects.length });
  })
);

// GET /api/projects/:id — public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const projects = await readCollection(DB_PATHS.projects);
    const record = projects.find((p) => p.id === req.params.id);
    if (!record) throw new AppError(`Project ${req.params.id} not found.`, 404);
    res.status(200).json({ data: record });
  })
);

// POST /api/projects — admin only: add a work item
router.post(
  "/",
  apiKeyAuth,
  asyncHandler(async (req, res) => {
    const payload = validateProjectPayload(req.body);
    const projects = await readCollection(DB_PATHS.projects);
    const record = { id: randomUUID(), ...payload, createdAt: new Date().toISOString() };
    projects.push(record);
    await writeCollection(DB_PATHS.projects, projects);
    res.status(201).json({ data: record });
  })
);

export default router;
