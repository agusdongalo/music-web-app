type RequestInit = Parameters<typeof fetch>[1];

type ItunesResponse<T> = {
  resultCount: number;
  results: T[];
};

type ItunesTrack = {
  trackId: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  artworkUrl100?: string;
  trackViewUrl?: string;
};

type ItunesAlbum = {
  collectionId: number;
  collectionName?: string;
  artistName?: string;
  artworkUrl100?: string;
  collectionViewUrl?: string;
};

type ItunesArtist = {
  artistId: number;
  artistName?: string;
  artistLinkUrl?: string;
};

type ItunesPodcast = {
  collectionId: number;
  collectionName?: string;
  artistName?: string;
  artworkUrl100?: string;
  collectionViewUrl?: string;
  feedUrl?: string;
};

export type ItunesSearchResults = {
  tracks: Array<{
    id: string;
    title: string;
    artistName?: string;
    albumName?: string;
    durationSec?: number;
    audioUrl?: string;
    coverUrl?: string;
    externalUrl?: string;
    source: "itunes";
  }>;
  albums: Array<{
    id: string;
    title: string;
    artistName?: string;
    coverUrl?: string;
    externalUrl?: string;
    source: "itunes";
  }>;
  artists: Array<{
    id: string;
    name: string;
    imageUrl?: string;
    externalUrl?: string;
    source: "itunes";
  }>;
  podcasts: Array<{
    id: string;
    title: string;
    author?: string;
    coverUrl?: string;
    feedUrl?: string;
    externalUrl?: string;
    source: "itunes";
  }>;
};

type MusicBrainzArtistResponse = {
  artists?: Array<{ id: string; name: string }>;
};

type MusicBrainzReleaseResponse = {
  releases?: Array<{
    id: string;
    title: string;
    "artist-credit"?: Array<{ name?: string; artist?: { name?: string } }>;
  }>;
};

export type MusicBrainzSearchResults = {
  artists: Array<{
    id: string;
    name: string;
    externalUrl?: string;
    source: "musicbrainz";
  }>;
  albums: Array<{
    id: string;
    title: string;
    artistName?: string;
    externalUrl?: string;
    source: "musicbrainz";
  }>;
};

export type ExternalSearchResults = {
  itunes: ItunesSearchResults;
  musicbrainz: MusicBrainzSearchResults;
  errors?: { itunes?: string; musicbrainz?: string };
};

const ITUNES_BASE_URL = "https://itunes.apple.com/search";
const MUSICBRAINZ_BASE_URL = "https://musicbrainz.org/ws/2";
const MAX_LIMIT = 25;
const DEFAULT_LIMIT = 10;

const EMPTY_ITUNES: ItunesSearchResults = {
  tracks: [],
  albums: [],
  artists: [],
  podcasts: [],
};

const EMPTY_MUSICBRAINZ: MusicBrainzSearchResults = {
  artists: [],
  albums: [],
};

function clampLimit(limit?: number) {
  if (!limit || Number.isNaN(limit)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.floor(limit), 1), MAX_LIMIT);
}

function normalizeArtwork(url?: string | null) {
  if (!url) return undefined;
  return url.replace("100x100", "300x300");
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`External request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

function buildItunesUrl(params: Record<string, string | number>) {
  const url = new URL(ITUNES_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function buildMusicBrainzUrl(
  endpoint: "artist" | "release",
  query: string,
  limit: number
) {
  const url = new URL(`${MUSICBRAINZ_BASE_URL}/${endpoint}`);
  url.searchParams.set("query", query);
  url.searchParams.set("fmt", "json");
  url.searchParams.set("limit", String(limit));
  return url.toString();
}

export async function searchItunes(
  query: string,
  limit?: number
): Promise<ItunesSearchResults> {
  const safeLimit = clampLimit(limit);
  const [trackResponse, albumResponse, artistResponse, podcastResponse] =
    await Promise.all([
      fetchJson<ItunesResponse<ItunesTrack>>(
        buildItunesUrl({
          term: query,
          media: "music",
          entity: "song",
          limit: safeLimit,
        })
      ),
      fetchJson<ItunesResponse<ItunesAlbum>>(
        buildItunesUrl({
          term: query,
          media: "music",
          entity: "album",
          limit: safeLimit,
        })
      ),
      fetchJson<ItunesResponse<ItunesArtist>>(
        buildItunesUrl({
          term: query,
          media: "music",
          entity: "musicArtist",
          limit: safeLimit,
        })
      ),
      fetchJson<ItunesResponse<ItunesPodcast>>(
        buildItunesUrl({
          term: query,
          media: "podcast",
          entity: "podcast",
          limit: safeLimit,
        })
      ),
    ]);

  const tracks = trackResponse.results
    .filter((item) => item.trackId && item.trackName && item.previewUrl)
    .map((item) => ({
      id: `itunes:track:${item.trackId}`,
      title: item.trackName ?? "Unknown title",
      artistName: item.artistName ?? "Unknown artist",
      albumName: item.collectionName ?? undefined,
      durationSec: item.trackTimeMillis
        ? Math.round(item.trackTimeMillis / 1000)
        : undefined,
      audioUrl: item.previewUrl ?? undefined,
      coverUrl: normalizeArtwork(item.artworkUrl100),
      externalUrl: item.trackViewUrl ?? undefined,
      source: "itunes" as const,
    }));

  const albums = albumResponse.results
    .filter((item) => item.collectionId && item.collectionName)
    .map((item) => ({
      id: `itunes:album:${item.collectionId}`,
      title: item.collectionName ?? "Unknown album",
      artistName: item.artistName ?? undefined,
      coverUrl: normalizeArtwork(item.artworkUrl100),
      externalUrl: item.collectionViewUrl ?? undefined,
      source: "itunes" as const,
    }));

  const artists = artistResponse.results
    .filter((item) => item.artistId && item.artistName)
    .map((item) => ({
      id: `itunes:artist:${item.artistId}`,
      name: item.artistName ?? "Unknown artist",
      imageUrl: undefined,
      externalUrl: item.artistLinkUrl ?? undefined,
      source: "itunes" as const,
    }));

  const podcasts = podcastResponse.results
    .filter((item) => item.collectionId && item.collectionName)
    .map((item) => ({
      id: `itunes:podcast:${item.collectionId}`,
      title: item.collectionName ?? "Unknown podcast",
      author: item.artistName ?? undefined,
      coverUrl: normalizeArtwork(item.artworkUrl100),
      feedUrl: item.feedUrl ?? undefined,
      externalUrl: item.collectionViewUrl ?? undefined,
      source: "itunes" as const,
    }));

  return { tracks, albums, artists, podcasts };
}

export async function searchMusicBrainz(
  query: string,
  limit?: number
): Promise<MusicBrainzSearchResults> {
  const safeLimit = clampLimit(limit);
  const headers = {
    "User-Agent":
      process.env.MB_USER_AGENT ??
      "music-app/0.1 (https://example.com/contact)",
  };

  const [artistResponse, releaseResponse] = await Promise.all([
    fetchJson<MusicBrainzArtistResponse>(
      buildMusicBrainzUrl("artist", query, safeLimit),
      { headers }
    ),
    fetchJson<MusicBrainzReleaseResponse>(
      buildMusicBrainzUrl("release", query, safeLimit),
      { headers }
    ),
  ]);

  const artists =
    artistResponse.artists?.map((artist) => ({
      id: `mb:artist:${artist.id}`,
      name: artist.name,
      externalUrl: `https://musicbrainz.org/artist/${artist.id}`,
      source: "musicbrainz" as const,
    })) ?? [];

  const albums =
    releaseResponse.releases?.map((release) => {
      const credit = release["artist-credit"]?.[0];
      const artistName = credit?.name ?? credit?.artist?.name;
      return {
        id: `mb:release:${release.id}`,
        title: release.title,
        artistName,
        externalUrl: `https://musicbrainz.org/release/${release.id}`,
        source: "musicbrainz" as const,
      };
    }) ?? [];

  return { artists, albums };
}

export async function searchExternalCatalog(
  query: string,
  limit?: number
): Promise<ExternalSearchResults> {
  const [itunesResult, musicBrainzResult] = await Promise.allSettled([
    searchItunes(query, limit),
    searchMusicBrainz(query, limit),
  ]);

  const errors: { itunes?: string; musicbrainz?: string } = {};

  let itunes = EMPTY_ITUNES;
  if (itunesResult.status === "fulfilled") {
    itunes = itunesResult.value;
  } else {
    errors.itunes =
      itunesResult.reason instanceof Error
        ? itunesResult.reason.message
        : "iTunes search failed";
  }

  let musicbrainz = EMPTY_MUSICBRAINZ;
  if (musicBrainzResult.status === "fulfilled") {
    musicbrainz = musicBrainzResult.value;
  } else {
    errors.musicbrainz =
      musicBrainzResult.reason instanceof Error
        ? musicBrainzResult.reason.message
        : "MusicBrainz search failed";
  }

  return Object.keys(errors).length
    ? { itunes, musicbrainz, errors }
    : { itunes, musicbrainz };
}
