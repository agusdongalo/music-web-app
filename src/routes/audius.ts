import { Router } from "express";
import { searchAudiusCatalog } from "../controllers/audiusController";

const router = Router();

router.get("/search", searchAudiusCatalog);

export default router;
