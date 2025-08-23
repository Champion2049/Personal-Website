import type { Handler } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { insertGuestbookSchema } from "../../shared/schema";
import { randomUUID } from "crypto";

type Entry = {
  id: string;
  name: string;
  email: string | null;
  message: string;
  createdAt: string;
};

const STORE_NAME = "guestbook"; // logical bucket
const STORE_KEY = "entries.json"; // single JSON array

async function readEntries(): Promise<Entry[]> {
  const store = getStore(STORE_NAME);
  const data = await store.get(STORE_KEY, { type: "json" });
  return (data as Entry[] | null) ?? [];
}

async function writeEntries(entries: Entry[]): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.set(STORE_KEY, JSON.stringify(entries), {
    contentType: "application/json",
  });
}

export const handler: Handler = async (event) => {
  // Basic method routing
  if (event.httpMethod === "OPTIONS") {
    // CORS preflight (not strictly needed for same-origin)
    return {
      statusCode: 204,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
    };
  }

  try {
    if (event.httpMethod === "GET") {
      const entries = await readEntries();
      // sort by createdAt desc
      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entries),
      };
    }

    if (event.httpMethod === "POST") {
      if (!event.body) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing body" }) };
      }
      // Validate with shared schema
      const parsed = insertGuestbookSchema.parse(JSON.parse(event.body));
      const newEntry: Entry = {
        id: randomUUID(),
        name: parsed.name,
        email: parsed.email ?? null,
        message: parsed.message,
        createdAt: new Date().toISOString(),
      };

      const entries = await readEntries();
      entries.push(newEntry);
      await writeEntries(entries);

      return {
        statusCode: 201,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err: any) {
    const msg = err?.message ?? "Internal Error";
    return { statusCode: 400, body: JSON.stringify({ error: msg }) };
  }
};
