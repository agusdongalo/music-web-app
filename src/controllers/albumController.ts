import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getAlbums(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const albums = await prisma.album.findMany({
      include: { artist: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(albums);
  } catch (err) {
    next(err);
  }
}

export async function getAlbumById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const album = await prisma.album.findUnique({
      where: { id: req.params.id },
      include: {
        artist: true,
        tracks: true,
      },
    });

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.json(album);
  } catch (err) {
    next(err);
  }
}
