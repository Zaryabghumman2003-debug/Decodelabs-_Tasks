import { AppError } from "../utils/AppError.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUDGETS = ["under-5k", "5-15k", "15-40k", "40k-plus"];

export function validateContactPayload(body) {
  const errors = [];
  const { name, email, budget, message } = body ?? {};

  if (typeof name !== "string" || !name.trim()) {
    errors.push({ field: "name", message: "name is required and must be a non-empty string." });
  } else if (name.trim().length > 120) {
    errors.push({ field: "name", message: "name must be 120 characters or fewer." });
  }

  if (typeof email !== "string" || !email.trim()) {
    errors.push({ field: "email", message: "email is required and must be a non-empty string." });
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.push({ field: "email", message: "email must be a valid email address." });
  }

  if (typeof message !== "string" || !message.trim()) {
    errors.push({ field: "message", message: "message is required and must be a non-empty string." });
  } else if (message.trim().length > 4000) {
    errors.push({ field: "message", message: "message must be 4000 characters or fewer." });
  }

  if (budget !== undefined && budget !== null && budget !== "" && !BUDGETS.includes(budget)) {
    errors.push({ field: "budget", message: `budget must be one of: ${BUDGETS.join(", ")}.` });
  }

  if (errors.length) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    budget: budget || null,
    message: message.trim(),
  };
}
