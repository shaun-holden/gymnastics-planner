import type { Express, RequestHandler } from "express";
import session from "express-session";

export async function setupAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  }));
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  next();
};

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  });
}

export const authStorage = {
  upsertUser: async (user: any) => user,
  getUser: async (id: string) => null,
};

export type IAuthStorage = typeof authStorage;

export function registerAuthRoutes(app: Express) {}
