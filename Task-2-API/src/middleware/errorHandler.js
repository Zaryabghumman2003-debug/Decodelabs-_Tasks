// Centralized error handler — every route forwards failures here via
// asyncHandler/next(err) instead of handling them locally.
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.isOperational ? err.message : "Something went wrong on our end.";
  let details = err.details;

  // express.json() throws a non-operational SyntaxError for malformed bodies.
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Malformed JSON in request body.";
    details = undefined;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(details ? { details } : {}),
    },
  });
}
