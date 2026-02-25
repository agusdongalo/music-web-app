import { NextFunction, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export async function getTrackById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const track = await prisma.track.findUnique({
      where: { id: req.params.id },
      include: {
        artist: true,
        album: true,
      },
    });

    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    res.json(track);
  } catch (err) {
    next(err);
  }
}

export async function likeTrack(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const trackId = req.params.id;

    await prisma.likedTrack.upsert({
      where: { userId_trackId: { userId, trackId } },
      update: {},
      create: { userId, trackId },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function unlikeTrack(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const trackId = req.params.id;

    await prisma.likedTrack.delete({
      where: { userId_trackId: { userId, trackId } },
    });

    res.status(204).send();
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(204).send();
    }
    next(err);
  }
}
