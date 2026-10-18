import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertGuestbookSchema } from "@shared/schema";
import { storage } from "./storage";
import { fetchMal } from "../netlify/functions/_mal";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

async function getSpotifyToken(): Promise<string | null> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  try {
    const r = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: SPOTIFY_REFRESH_TOKEN }),
    });
    if (!r.ok) return null;
    const d: any = await r.json();
    return d.access_token || null;
  } catch {
    return null;
  }
}

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

  // Spotify (dev server mirror of the Netlify functions; needs SPOTIFY_* env vars).
  app.get('/api/spotify', async (_req, res) => {
    const token = await getSpotifyToken();
    if (!token) return res.json({ isPlaying: false, title: 'Nothing to show' });
    try {
      const now = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers: { Authorization: `Bearer ${token}` } });
      if (now.status === 200) {
        const song: any = await now.json();
        // Accept the track even when paused — recently-played lags behind, so the
        // active/paused track is the most accurate "what I'm on right now".
        if (song?.item) {
          return res.json({
            album: song.item.album.name,
            albumImageUrl: song.item.album.images[0]?.url,
            artist: song.item.artists.map((a: any) => a.name).join(', '),
            isPlaying: !!song.is_playing,
            songUrl: song.item.external_urls.spotify,
            title: song.item.name,
          });
        }
      }
      const rec = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers: { Authorization: `Bearer ${token}` } });
      if (rec.status === 200) {
        const data: any = await rec.json();
        const last = data.items?.[0]?.track;
        if (last) {
          return res.json({
            album: last.album.name,
            albumImageUrl: last.album.images[0]?.url,
            artist: last.artists.map((a: any) => a.name).join(', '),
            isPlaying: false,
            songUrl: last.external_urls.spotify,
            title: last.name,
          });
        }
      }
    } catch {
      /* ignore — fall through to offline payload */
    }
    return res.json({ isPlaying: false, title: 'Nothing to show' });
  });

  // MyAnimeList (same module as the Netlify function; MAL_CLIENT_ID optional).
  app.get('/api/mal', async (_req, res) => {
    try {
      res.json(await fetchMal('Champion2049', process.env.MAL_CLIENT_ID));
    } catch (e) {
      res.status(502).json({ error: e instanceof Error ? e.message : String(e) });
    }
  });

  app.get('/api/spotify-stats', async (_req, res) => {
    const token = await getSpotifyToken();
    if (!token) return res.json([]);
    try {
      const r = await fetch('https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5', { headers: { Authorization: `Bearer ${token}` } });
      if (r.status !== 200) return res.json([]);
      const data: any = await r.json();
      const artists = (data.items || []).map((a: any) => ({
        name: a.name,
        url: a.external_urls.spotify,
        image: a.images?.[0]?.url,
        genres: (a.genres || []).slice(0, 2),
      }));
      return res.json(artists);
    } catch {
      return res.json([]);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
