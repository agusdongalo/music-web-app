import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  addTrack,
  createNewPlaylist,
  getMyPlaylists,
  getPlaylistById,
  removeTrack,
} from "../controllers/playlistController";

const router = Router();

router.use(requireAuth);

router.post("/", createNewPlaylist);
router.get("/", getMyPlaylists);
router.get("/:id", getPlaylistById);
router.post("/:id/tracks", addTrack);
router.delete("/:id/tracks/:trackId", removeTrack);

export default router;
