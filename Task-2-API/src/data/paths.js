import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DB_PATHS = {
  contacts: join(__dirname, "db", "contacts.json"),
  subscribers: join(__dirname, "db", "subscribers.json"),
  projects: join(__dirname, "db", "projects.json"),
};
