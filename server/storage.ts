import { type User, type InsertUser, type Guestbook, type InsertGuestbook } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Guestbook methods
  getGuestbookEntries(): Promise<Guestbook[]>;
  createGuestbookEntry(entry: InsertGuestbook): Promise<Guestbook>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private guestbook: Map<string, Guestbook>;

  constructor() {
    this.users = new Map();
    this.guestbook = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getGuestbookEntries(): Promise<Guestbook[]> {
    return Array.from(this.guestbook.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createGuestbookEntry(insertGuestbook: InsertGuestbook): Promise<Guestbook> {
    const id = randomUUID();
    const guestbookEntry: Guestbook = {
      ...insertGuestbook,
      id,
      email: insertGuestbook.email || null,
      createdAt: new Date()
    };
    this.guestbook.set(id, guestbookEntry);
    return guestbookEntry;
  }
}

export const storage = new MemStorage();
