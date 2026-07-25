import { AppError } from "../utils/AppError.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateNewsletterPayload(body) {
  const errors = [];
  const { email } = body ?? {};

  if (typeof email !== "string" || !email.trim()) {
    errors.push({ field: "email", message: "email is required and must be a non-empty string." });
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.push({ field: "email", message: "email must be a valid email address." });
  }

  if (errors.length) {
    throw new AppError("Validation failed.", 400, errors);
  }

  return { email: email.trim().toLowerCase() };
}
