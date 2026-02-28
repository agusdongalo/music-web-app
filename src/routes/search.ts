import { Router } from "express";
import { search, searchExternal } from "../controllers/searchController";

const router = Router();

router.get("/", search);
router.get("/external", searchExternal);

export default router;
