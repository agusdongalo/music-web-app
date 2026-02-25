import { Router } from "express";
import { getAlbumById, getAlbums } from "../controllers/albumController";

const router = Router();

router.get("/", getAlbums);
router.get("/:id", getAlbumById);

export default router;
