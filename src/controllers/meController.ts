import { NextFunction, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function getLikedTracks(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const liked = await prisma.likedTrack.findMany({
      where: { userId },
      include: {
        track: { include: { artist: true, album: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(liked.map((item) => item.track));
  } catch (err) {
    next(err);
  }
}
