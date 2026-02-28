import { NextFunction, Request, Response } from "express";
import { env } from "../env";
import {
  getAudiusPlaylist,
  getAudiusPlaylistTracks,
  searchAudius,
} from "../services/audiusService";

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

export async function audiusPlaylistTracks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const playlistId = (req.params.id ?? "").toString().trim();
    if (!playlistId) {
      return res.status(400).json({ message: "Missing playlist id" });
    }

    const tracks = await getAudiusPlaylistTracks(
      playlistId,
      env.AUDIUS_APP_NAME
    );

    res.json(tracks);
  } catch (err) {
    next(err);
  }
}

export async function audiusPlaylistDetail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const playlistId = (req.params.id ?? "").toString().trim();
    if (!playlistId) {
      return res.status(400).json({ message: "Missing playlist id" });
    }

    const playlist = await getAudiusPlaylist(
      playlistId,
      env.AUDIUS_APP_NAME
    );

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.json(playlist);
  } catch (err) {
    next(err);
  }
}
