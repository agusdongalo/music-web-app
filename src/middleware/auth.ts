import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
