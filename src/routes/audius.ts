import { Router } from "express";
import {
  audiusPlaylistDetail,
  audiusPlaylistTracks,
  searchAudiusCatalog,
} from "../controllers/audiusController";

const router = Router();

router.get("/search", searchAudiusCatalog);
router.get("/playlists/:id", audiusPlaylistDetail);
router.get("/playlists/:id/tracks", audiusPlaylistTracks);

export default router;
