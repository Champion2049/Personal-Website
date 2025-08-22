import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertGuestbookSchema } from "@shared/schema";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Guestbook routes
  app.get('/api/guestbook', async (req, res) => {
    try {
      const entries = await storage.getGuestbookEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch guestbook entries' });
    }
  });

  app.post('/api/guestbook', async (req, res) => {
    try {
      const validatedEntry = insertGuestbookSchema.parse(req.body);
      const newEntry = await storage.createGuestbookEntry(validatedEntry);
      res.status(201).json(newEntry);
    } catch (error) {
      res.status(400).json({ error: 'Invalid guestbook entry data' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
