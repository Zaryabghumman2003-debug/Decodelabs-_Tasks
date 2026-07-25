import { AppError } from "../utils/AppError.js";

export function apiKeyAuth(req, res, next) {
  const key = req.get("x-api-key");
  if (!key) {
    return next(new AppError("Missing API key. Send it in the 'x-api-key' header.", 401));
  }
  if (key !== process.env.API_KEY) {
    return next(new AppError("Invalid API key.", 403));
  }
  next();
}
