import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user =
    (await prisma.user.findUnique({ where: { email: "demo@music.app" } })) ??
    (await prisma.user.create({
      data: {
        email: "demo@music.app",
        passwordHash,
        displayName: "Demo User",
      },
    }));

  const existingArtist = await prisma.artist.findFirst({
    where: { name: "Midnight Echoes" },
  });
  const artist =
    existingArtist ??
    (await prisma.artist.create({
      data: {
        name: "Midnight Echoes",
        bio: "Dreamy synth-pop with cinematic textures.",
        imageUrl:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
      },
    }));

  const album = await prisma.album.create({
    data: {
      title: "First Light",
      coverUrl:
        "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
      releaseDate: new Date("2024-06-01"),
      artistId: artist.id,
    },
  });

  const track = await prisma.track.create({
    data: {
      title: "City Skyline",
      durationSec: 215,
      audioUrl: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
      coverUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
      artistId: artist.id,
      albumId: album.id,
    },
  });

  const playlist = await prisma.playlist.create({
    data: {
      name: "Demo Playlist",
      isPublic: true,
      userId: user.id,
    },
  });

  await prisma.playlistTrack.create({
    data: {
      playlistId: playlist.id,
      trackId: track.id,
      position: 1,
    },
  });

  await prisma.likedTrack.create({
    data: {
      userId: user.id,
      trackId: track.id,
    },
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
