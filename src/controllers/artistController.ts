import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getArtists(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const artists = await prisma.artist.findMany({
      orderBy: { name: "asc" },
    });
    res.json(artists);
  } catch (err) {
    next(err);
  }
}

export async function getArtistById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id: req.params.id },
      include: {
        albums: true,
        tracks: true,
      },
    });

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.json(artist);
  } catch (err) {
    next(err);
  }
}
