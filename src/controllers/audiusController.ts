import { NextFunction, Request, Response } from "express";
import { env } from "../env";
import { searchAudius } from "../services/audiusService";

export async function searchAudiusCatalog(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const q = (req.query.q ?? "").toString().trim();
    if (!q) {
      return res.status(400).json({ message: "Missing search query" });
    }

    const limit = Number(req.query.limit ?? 10);
    const results = await searchAudius(
      q,
      env.AUDIUS_APP_NAME,
      Number.isFinite(limit) ? limit : undefined
    );

    res.json(results);
  } catch (err) {
    next(err);
  }
}
