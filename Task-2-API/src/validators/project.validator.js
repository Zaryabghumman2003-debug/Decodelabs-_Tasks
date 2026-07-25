import { AppError } from "../utils/AppError.js";

const TONES = ["mocha", "blue", "grey"];

export function validateProjectPayload(body) {
  const errors = [];
  const { title, tag, tone, description } = body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    errors.push({ field: "title", message: "title is required and must be a non-empty string." });
  }
  if (typeof tag !== "string" || !tag.trim()) {
    errors.push({ field: "tag", message: "tag is required and must be a non-empty string." });
  }
  if (typeof description !== "string" || !description.trim()) {
    errors.push({ field: "description", message: "description is required and must be a non-empty string." });
  }
  if (tone !== undefined && tone !== null && tone !== "" && !TONES.includes(tone)) {
    errors.push({ field: "tone", message: `tone must be one of: ${TONES.join(", ")}.` });
  }

  if (errors.length) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return {
    title: title.trim(),
    tag: tag.trim(),
    tone: tone || "mocha",
    description: description.trim(),
  };
}
