import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getLikedTracks, getMe } from "../controllers/meController";

const router = Router();

router.use(requireAuth);
router.get("/", getMe);
router.get("/liked-tracks", getLikedTracks);

export default router;
