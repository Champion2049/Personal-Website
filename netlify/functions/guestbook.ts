import type { Handler } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { randomUUID } from "crypto";
import { z } from "zod";

type Entry = {
  id: string;
  name: string;
  email: string | null;
  message: string;
  createdAt: string;
};

const insertGuestbookSchema = z.object({
  name: z.string().min(1),
  email: z.string().optional().nullable(),
  message: z.string().min(1),
});

const STORE_NAME = "guestbook"; // logical bucket
const STORE_KEY = "entries.json"; // single JSON array

function getConfiguredStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }
  return getStore(STORE_NAME);
}

async function readEntries(): Promise<Entry[]> {
  const store = getConfiguredStore();
  const data = await store.get(STORE_KEY, { type: "json" });
  return (data as Entry[] | null) ?? [];
}

async function writeEntries(entries: Entry[]): Promise<void> {
  const store = getConfiguredStore();
  await store.setJSON(STORE_KEY, entries);
}

export const handler: Handler = async (event) => {
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  // Basic method routing
  if (event.httpMethod === "OPTIONS") {
    // CORS preflight (not strictly needed for same-origin)
    return {
      statusCode: 204,
      headers: baseHeaders,
    };
  }

  try {
    if (event.httpMethod === "GET") {
      const entries = await readEntries();
      // sort by createdAt desc
      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { statusCode: 200, headers: baseHeaders, body: JSON.stringify(entries) };
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

      return { statusCode: 201, headers: baseHeaders, body: JSON.stringify(newEntry) };
    }

    return { statusCode: 405, headers: baseHeaders, body: JSON.stringify({ error: "Method Not Allowed" }) };
  } catch (err: any) {
    const msg = err?.message ?? "Internal Error";
    return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: msg }) };
  }
};
