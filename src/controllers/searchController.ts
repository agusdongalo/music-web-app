import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { searchExternalCatalog } from "../services/externalSearchService";

export async function search(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const q = (req.query.q ?? "").toString().trim();
    if (!q) {
      return res.status(400).json({ message: "Missing search query" });
    }

    const [artists, albums, tracks] = await Promise.all([
      prisma.artist.findMany({
        where: { name: { contains: q } },
        orderBy: { name: "asc" },
      }),
      prisma.album.findMany({
        where: { title: { contains: q } },
        include: { artist: true },
        orderBy: { title: "asc" },
      }),
      prisma.track.findMany({
        where: { title: { contains: q } },
        include: { artist: true, album: true },
        orderBy: { title: "asc" },
      }),
    ]);

    res.json({ artists, albums, tracks });
  } catch (err) {
    next(err);
  }
}

export async function searchExternal(
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
    const results = await searchExternalCatalog(
      q,
      Number.isFinite(limit) ? limit : undefined
    );

    res.json(results);
  } catch (err) {
    next(err);
  }
}
