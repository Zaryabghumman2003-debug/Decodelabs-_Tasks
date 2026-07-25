import express from "express";
import cors from "cors";
import contactRoutes from "./routes/contact.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "50kb" }));

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/contact", contactRoutes);
  app.use("/api/newsletter", newsletterRoutes);
  app.use("/api/projects", projectRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
