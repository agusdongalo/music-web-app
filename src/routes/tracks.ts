import { Router } from "express";
import {
  getTracks,
  getTrackById,
  likeTrack,
  unlikeTrack,
} from "../controllers/trackController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", getTracks);
router.get("/:id", getTrackById);
router.post("/:id/like", requireAuth, likeTrack);
router.delete("/:id/like", requireAuth, unlikeTrack);

export default router;
