import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth.service";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

/** Requires a valid JWT for ANY logged-in user (admin or customer). */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}

/** Attaches userId/userRole if a valid token is present, but never blocks the request. */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      req.userId = payload.sub;
      req.userRole = payload.role;
    } catch {
      // Invalid/expired token on an optional route — proceed as guest.
    }
  }
  next();
}
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Admin authentication required." });
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access only." });
    }
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired admin session." });
  }
}
