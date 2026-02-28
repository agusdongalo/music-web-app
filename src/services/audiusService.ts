type RequestInit = Parameters<typeof fetch>[1];

type AudiusResponse<T> = {
  data: T[];
};

type AudiusArtwork = Partial<Record<"150x150" | "480x480" | "1000x1000", string>>;

type AudiusUser = {
  id: string;
  name?: string;
  handle?: string;
  profile_picture?: AudiusArtwork;
};

type AudiusTrack = {
  id: string;
  title?: string;
  duration?: number;
  artwork?: AudiusArtwork;
  user?: AudiusUser;
  permalink?: string;
};

type AudiusPlaylist = {
  id?: string;
  playlist_id?: string;
  playlist_name?: string;
  artwork?: AudiusArtwork;
  user?: AudiusUser;
  permalink?: string;
};

export type AudiusSearchResults = {
  tracks: Array<{
    id: string;
    title: string;
    artistName?: string;
    durationSec?: number;
    audioUrl: string;
    coverUrl?: string;
    externalUrl?: string;
    source: "audius";
  }>;
  artists: Array<{
    id: string;
    name: string;
    imageUrl?: string;
    externalUrl?: string;
    source: "audius";
  }>;
  playlists: Array<{
    id: string;
    title: string;
    ownerName?: string;
    coverUrl?: string;
    externalUrl?: string;
    source: "audius";
  }>;
};

const AUDIUS_BASE_URL = "https://api.audius.co/v1";
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

function clampLimit(limit?: number) {
  if (!limit || Number.isNaN(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.floor(limit), 1), MAX_LIMIT);
}

function pickArtwork(artwork?: AudiusArtwork) {
  return (
    artwork?.["1000x1000"] ??
    artwork?.["480x480"] ??
    artwork?.["150x150"] ??
    undefined
  );
}

function buildAudiusUrl(path: string, params: Record<string, string | number>) {
  const url = new URL(`${AUDIUS_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Audius request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export async function searchAudius(
  query: string,
  appName?: string,
  limit?: number
): Promise<AudiusSearchResults> {
  const safeLimit = clampLimit(limit);
  const appParam = appName ?? "music-app";

  const [tracksRes, usersRes, playlistsRes] = await Promise.all([
    fetchJson<AudiusResponse<AudiusTrack>>(
      buildAudiusUrl("/tracks/search", {
        query,
        limit: safeLimit,
        app_name: appParam,
      })
    ),
    fetchJson<AudiusResponse<AudiusUser>>(
      buildAudiusUrl("/users/search", {
        query,
        limit: safeLimit,
        app_name: appParam,
      })
    ),
    fetchJson<AudiusResponse<AudiusPlaylist>>(
      buildAudiusUrl("/playlists/search", {
        query,
        limit: safeLimit,
        app_name: appParam,
      })
    ),
  ]);

  const tracks = (tracksRes.data ?? []).map((track) => ({
    id: track.id,
    title: track.title ?? "Unknown title",
    artistName: track.user?.name ?? track.user?.handle,
    durationSec: track.duration,
    audioUrl: buildAudiusUrl(`/tracks/${track.id}/stream`, {
      app_name: appParam,
    }),
    coverUrl: pickArtwork(track.artwork),
    externalUrl: track.permalink ? `https://audius.co${track.permalink}` : undefined,
    source: "audius" as const,
  }));

  const artists = (usersRes.data ?? []).map((user) => ({
    id: user.id,
    name: user.name ?? user.handle ?? "Unknown artist",
    imageUrl: pickArtwork(user.profile_picture),
    externalUrl: user.handle ? `https://audius.co/${user.handle}` : undefined,
    source: "audius" as const,
  }));

  const playlists = (playlistsRes.data ?? []).map((playlist) => {
    const id = playlist.id ?? playlist.playlist_id ?? "";
    return {
      id,
      title: playlist.playlist_name ?? "Untitled playlist",
      ownerName: playlist.user?.name ?? playlist.user?.handle,
      coverUrl: pickArtwork(playlist.artwork),
      externalUrl: playlist.permalink
        ? `https://audius.co${playlist.permalink}`
        : undefined,
      source: "audius" as const,
    };
  }).filter((playlist) => playlist.id);

  return { tracks, artists, playlists };
}
