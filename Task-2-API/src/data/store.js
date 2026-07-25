import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const writeQueues = new Map();

async function ensureDir(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

export async function readCollection(filePath) {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

// Serializes writes per file so two near-simultaneous requests can't
// read-modify-write over each other and drop a record.
function queueWrite(filePath, task) {
  const prev = writeQueues.get(filePath) || Promise.resolve();
  const next = prev.then(task, task);
  writeQueues.set(filePath, next.catch(() => {}));
  return next;
}

export function writeCollection(filePath, data) {
  return queueWrite(filePath, async () => {
    await ensureDir(filePath);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  });
}
