import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

const artistsData = [
  {
    name: "Midnight Echoes",
    bio: "Dreamy synth-pop with cinematic textures.",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
  },
  {
    name: "Neon Drift",
    bio: "Late-night electronic grooves and neon haze.",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
  },
  {
    name: "Crimson Skyline",
    bio: "Alt-pop with warm vocals and city lights.",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  },
  {
    name: "Luna Waves",
    bio: "Ambient chillhop with lunar tones.",
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
  },
];

const albumsData = [
  {
    title: "First Light",
    coverUrl: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2",
    releaseDate: "2024-06-01",
    artistName: "Midnight Echoes",
  },
  {
    title: "Night Drive",
    coverUrl: "https://images.unsplash.com/photo-1485579149621-3123dd979885",
    releaseDate: "2024-08-14",
    artistName: "Neon Drift",
  },
  {
    title: "Crimson Lounge",
    coverUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491",
    releaseDate: "2023-11-18",
    artistName: "Crimson Skyline",
  },
  {
    title: "Moonlit Focus",
    coverUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3",
    releaseDate: "2024-03-09",
    artistName: "Luna Waves",
  },
];

const tracksData = [
  {
    title: "City Skyline",
    durationSec: 215,
    audioUrl: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
    artistName: "Midnight Echoes",
    albumTitle: "First Light",
  },
  {
    title: "Golden Hour",
    durationSec: 198,
    audioUrl: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
    coverUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    artistName: "Midnight Echoes",
    albumTitle: "First Light",
  },
  {
    title: "Neon Afterglow",
    durationSec: 236,
    audioUrl: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
    coverUrl: "https://images.unsplash.com/photo-1485579149621-3123dd979885",
    artistName: "Neon Drift",
    albumTitle: "Night Drive",
  },
  {
    title: "Highway Pulse",
    durationSec: 221,
    audioUrl: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    coverUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    artistName: "Neon Drift",
    albumTitle: "Night Drive",
  },
  {
    title: "Velvet City",
    durationSec: 203,
    audioUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
    coverUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491",
    artistName: "Crimson Skyline",
    albumTitle: "Crimson Lounge",
  },
  {
    title: "Soft Neon",
    durationSec: 190,
    audioUrl: "https://samplelib.com/lib/preview/mp3/sample-2s.mp3",
    coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    artistName: "Crimson Skyline",
    albumTitle: "Crimson Lounge",
  },
  {
    title: "Moonlit Rain",
    durationSec: 212,
    audioUrl: "https://samplelib.com/lib/preview/mp3/sample-5s.mp3",
    coverUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3",
    artistName: "Luna Waves",
    albumTitle: "Moonlit Focus",
  },
  {
    title: "Quiet Orbit",
    durationSec: 247,
    audioUrl: "https://samplelib.com/lib/preview/mp3/sample-7s.mp3",
    coverUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    artistName: "Luna Waves",
    albumTitle: "Moonlit Focus",
  },
];

const playlistData = [
  {
    name: "Neon Nights",
    isPublic: true,
    coverUrl: "https://images.unsplash.com/photo-1485579149621-3123dd979885",
    trackKeys: [
      "Neon Drift::Neon Afterglow",
      "Midnight Echoes::City Skyline",
      "Crimson Skyline::Velvet City",
    ],
  },
  {
    name: "Afterglow Focus",
    isPublic: true,
    coverUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3",
    trackKeys: [
      "Luna Waves::Moonlit Rain",
      "Luna Waves::Quiet Orbit",
      "Neon Drift::Highway Pulse",
    ],
  },
  {
    name: "Crimson Lounge",
    isPublic: true,
    coverUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491",
    trackKeys: [
      "Crimson Skyline::Soft Neon",
      "Midnight Echoes::Golden Hour",
      "Neon Drift::Neon Afterglow",
    ],
  },
];

const likedTrackKeys = [
  "Midnight Echoes::City Skyline",
  "Neon Drift::Neon Afterglow",
  "Luna Waves::Moonlit Rain",
];

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

  const artistMap = new Map<string, { id: string }>();
  for (const artist of artistsData) {
    const existing = await prisma.artist.findFirst({
      where: { name: artist.name },
    });
    const record =
      existing ??
      (await prisma.artist.create({
        data: {
          name: artist.name,
          bio: artist.bio,
          imageUrl: artist.imageUrl,
        },
      }));
    artistMap.set(artist.name, record);
  }

  const albumMap = new Map<string, { id: string }>();
  for (const album of albumsData) {
    const artist = artistMap.get(album.artistName);
    if (!artist) {
      continue;
    }

    const existing = await prisma.album.findFirst({
      where: { title: album.title, artistId: artist.id },
    });

    const record =
      existing ??
      (await prisma.album.create({
        data: {
          title: album.title,
          coverUrl: album.coverUrl,
          releaseDate: new Date(album.releaseDate),
          artistId: artist.id,
        },
      }));

    albumMap.set(`${album.artistName}::${album.title}`, record);
  }

  const trackMap = new Map<string, { id: string }>();
  for (const track of tracksData) {
    const artist = artistMap.get(track.artistName);
    if (!artist) {
      continue;
    }

    const album = albumMap.get(`${track.artistName}::${track.albumTitle}`);
    const existing = await prisma.track.findFirst({
      where: {
        title: track.title,
        artistId: artist.id,
        albumId: album?.id ?? null,
      },
    });

    const record =
      existing ??
      (await prisma.track.create({
        data: {
          title: track.title,
          durationSec: track.durationSec,
          audioUrl: track.audioUrl,
          coverUrl: track.coverUrl,
          artistId: artist.id,
          albumId: album?.id ?? null,
        },
      }));

    trackMap.set(`${track.artistName}::${track.title}`, record);
  }

  for (const playlist of playlistData) {
    const existing = await prisma.playlist.findFirst({
      where: { name: playlist.name, userId: user.id },
    });

    const record =
      existing ??
      (await prisma.playlist.create({
        data: {
          name: playlist.name,
          isPublic: playlist.isPublic,
          coverUrl: playlist.coverUrl,
          userId: user.id,
        },
      }));

    const items = playlist.trackKeys
      .map((key, index) => {
        const track = trackMap.get(key);
        if (!track) {
          return null;
        }
        return {
          playlistId: record.id,
          trackId: track.id,
          position: index + 1,
        };
      })
      .filter(Boolean) as { playlistId: string; trackId: string; position: number }[];

    if (items.length > 0) {
      await prisma.playlistTrack.createMany({
        data: items,
        skipDuplicates: true,
      });
    }
  }

  const likedData = likedTrackKeys
    .map((key) => {
      const track = trackMap.get(key);
      if (!track) {
        return null;
      }
      return { userId: user.id, trackId: track.id };
    })
    .filter(Boolean) as { userId: string; trackId: string }[];

  if (likedData.length > 0) {
    await prisma.likedTrack.createMany({
      data: likedData,
      skipDuplicates: true,
    });
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
