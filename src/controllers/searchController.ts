import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

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
