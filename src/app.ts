import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import artistRouter from "./routes/artists";
import albumRouter from "./routes/albums";
import trackRouter from "./routes/tracks";
import playlistRouter from "./routes/playlists";
import searchRouter from "./routes/search";
import meRouter from "./routes/me";
import { errorHandler, notFound } from "./middleware/error";
import { env } from "./env";
import { prisma } from "./lib/prisma";

const app = express();

app.use(
  cors(
    env.CORS_ORIGIN
      ? { origin: env.CORS_ORIGIN, credentials: true }
      : { origin: "*" }
  )
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/health", async (_req, res, next) => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    res.json({
      ok: true,
      db: { status: "up", latencyMs },
      uptimeSec: Math.round(process.uptime()),
    });
  } catch (err) {
    next(err);
  }
});
app.get("/health/db", async (_req, res, next) => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    res.json({ ok: true, db: "up", latencyMs });
  } catch (err) {
    next(err);
  }
});

app.use("/auth", authRouter);
app.use("/artists", artistRouter);
app.use("/albums", albumRouter);
app.use("/tracks", trackRouter);
app.use("/playlists", playlistRouter);
app.use("/search", searchRouter);
app.use("/me", meRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
