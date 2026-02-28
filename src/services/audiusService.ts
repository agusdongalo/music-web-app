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
  description?: string;
  artwork?: AudiusArtwork;
  user?: AudiusUser;
  permalink?: string;
  track_count?: number;
  total_play_count?: number;
  created_at?: string;
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

export type AudiusTrackItem = {
  id: string;
  title: string;
  artistName?: string;
  durationSec?: number;
  audioUrl: string;
  coverUrl?: string;
  externalUrl?: string;
};

export type AudiusPlaylistDetail = {
  id: string;
  title: string;
  description?: string;
  ownerName?: string;
  coverUrl?: string;
  externalUrl?: string;
  trackCount?: number;
  playCount?: number;
  createdAt?: string;
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

function mapAudiusTrack(track: AudiusTrack, appParam: string): AudiusTrackItem {
  return {
    id: track.id,
    title: track.title ?? "Unknown title",
    artistName: track.user?.name ?? track.user?.handle,
    durationSec: track.duration,
    audioUrl: buildAudiusUrl(`/tracks/${track.id}/stream`, {
      app_name: appParam,
    }),
    coverUrl: pickArtwork(track.artwork),
    externalUrl: track.permalink ? `https://audius.co${track.permalink}` : undefined,
  };
}

function mapAudiusPlaylist(playlist: AudiusPlaylist) {
  const id = playlist.id ?? playlist.playlist_id ?? "";
  return {
    id,
    title: playlist.playlist_name ?? "Untitled playlist",
    description: playlist.description ?? undefined,
    ownerName: playlist.user?.name ?? playlist.user?.handle,
    coverUrl: pickArtwork(playlist.artwork),
    externalUrl: playlist.permalink
      ? `https://audius.co${playlist.permalink}`
      : undefined,
    trackCount: playlist.track_count ?? undefined,
    playCount: playlist.total_play_count ?? undefined,
    createdAt: playlist.created_at ?? undefined,
  };
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
    ...mapAudiusTrack(track, appParam),
    source: "audius" as const,
  }));

  const artists = (usersRes.data ?? []).map((user) => ({
    id: user.id,
    name: user.name ?? user.handle ?? "Unknown artist",
    imageUrl: pickArtwork(user.profile_picture),
    externalUrl: user.handle ? `https://audius.co/${user.handle}` : undefined,
    source: "audius" as const,
  }));

  const playlists = (playlistsRes.data ?? [])
    .map((playlist) => {
      const mapped = mapAudiusPlaylist(playlist);
      return {
        id: mapped.id,
        title: mapped.title,
        ownerName: mapped.ownerName,
        coverUrl: mapped.coverUrl,
        externalUrl: mapped.externalUrl,
        source: "audius" as const,
      };
    })
    .filter((playlist) => playlist.id);

  return { tracks, artists, playlists };
}

export async function getAudiusPlaylistTracks(
  playlistId: string,
  appName?: string
): Promise<AudiusTrackItem[]> {
  const appParam = appName ?? "music-app";
  const response = await fetchJson<AudiusResponse<AudiusTrack>>(
    buildAudiusUrl(`/playlists/${playlistId}/tracks`, {
      app_name: appParam,
    })
  );

  return (response.data ?? []).map((track) => mapAudiusTrack(track, appParam));
}

export async function getAudiusPlaylist(
  playlistId: string,
  appName?: string
): Promise<AudiusPlaylistDetail | null> {
  const appParam = appName ?? "music-app";
  const response = await fetchJson<{ data: AudiusPlaylist | AudiusPlaylist[] }>(
    buildAudiusUrl(`/playlists/${playlistId}`, {
      app_name: appParam,
    })
  );

  const raw = Array.isArray(response.data)
    ? response.data[0]
    : response.data;

  if (!raw) return null;
  const mapped = mapAudiusPlaylist(raw);
  if (!mapped.id) return null;
  return mapped;
}


