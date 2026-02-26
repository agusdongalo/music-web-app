import { NextFunction, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import {
  addTrackToPlaylist,
  createPlaylist,
  removeTrackFromPlaylist,
} from "../services/playlistService";

const createPlaylistSchema = z.object({
  name: z.string().min(1),
  isPublic: z.boolean().optional().default(false),
  coverUrl: z.string().url().optional().nullable(),
});

const addTrackSchema = z.object({
  trackId: z.string().min(1),
  position: z.number().int().positive().optional(),
});

export async function getPublicPlaylists(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const limitParam = Number(req.query.limit ?? 12);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 50)
      : 12;
    const playlists = await prisma.playlist.findMany({
      where: { isPublic: true },
      include: {
        user: { select: { displayName: true } },
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    res.json(playlists);
  } catch (err) {
    next(err);
  }
}

export async function getPublicPlaylistById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const playlist = await prisma.playlist.findFirst({
      where: { id: req.params.id, isPublic: true },
      include: {
        user: { select: { displayName: true } },
        items: {
          include: {
            track: { include: { artist: true, album: true } },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.json(playlist);
  } catch (err) {
    next(err);
  }
}

export async function createNewPlaylist(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const { name, isPublic, coverUrl } = createPlaylistSchema.parse(req.body);

    const playlist = await createPlaylist(
      userId,
      name,
      isPublic,
      coverUrl ?? null
    );
    res.status(201).json(playlist);
  } catch (err) {
    next(err);
  }
}

export async function getMyPlaylists(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    res.json(playlists);
  } catch (err) {
    next(err);
  }
}

export async function getPlaylistById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const playlist = await prisma.playlist.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            track: {
              include: { artist: true, album: true },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.userId !== userId && !playlist.isPublic) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(playlist);
  } catch (err) {
    next(err);
  }
}

export async function addTrack(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const playlistId = req.params.id;
    const { trackId, position } = addTrackSchema.parse(req.body);

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    if (playlist.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const item = await addTrackToPlaylist(playlistId, trackId, position);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function removeTrack(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const playlistId = req.params.id;
    const trackId = req.params.trackId;

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    if (playlist.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await removeTrackFromPlaylist(playlistId, trackId);
    res.status(204).send();
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(204).send();
    }
    next(err);
  }
}
