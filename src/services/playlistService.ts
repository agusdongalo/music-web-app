import { prisma } from "../lib/prisma";

export async function createPlaylist(
  userId: string,
  name: string,
  isPublic: boolean,
  coverUrl?: string | null
) {
  return prisma.playlist.create({
    data: {
      userId,
      name,
      isPublic,
      coverUrl: coverUrl ?? null,
    },
  });
}

export async function addTrackToPlaylist(
  playlistId: string,
  trackId: string,
  position?: number
) {
  const last = await prisma.playlistTrack.findFirst({
    where: { playlistId },
    orderBy: { position: "desc" },
  });

  const nextPosition = position ?? (last ? last.position + 1 : 1);

  return prisma.playlistTrack.create({
    data: {
      playlistId,
      trackId,
      position: nextPosition,
    },
  });
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  trackId: string
) {
  return prisma.playlistTrack.delete({
    where: {
      playlistId_trackId: {
        playlistId,
        trackId,
      },
    },
  });
}
