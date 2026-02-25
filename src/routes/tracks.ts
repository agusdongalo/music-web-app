import { Router } from "express";
import {
  getTrackById,
  likeTrack,
  unlikeTrack,
} from "../controllers/trackController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/:id", getTrackById);
router.post("/:id/like", requireAuth, likeTrack);
router.delete("/:id/like", requireAuth, unlikeTrack);

export default router;
