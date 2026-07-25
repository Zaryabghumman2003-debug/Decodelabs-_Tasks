import "dotenv/config";
import { createApp } from "./app.js";

if (!process.env.API_KEY) {
  console.warn(
    "[warn] API_KEY is not set - admin-protected endpoints will reject all requests. Set it in server/.env"
  );
}

const app = createApp();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Mocha Studio API listening on http://localhost:${port}`);
});
