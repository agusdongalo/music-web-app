import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import TrackRow from "../components/TrackRow";
import AddToPlaylistModal from "../components/AddToPlaylistModal";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";
import { useLikedTracks } from "../hooks/useLikedTracks";
import HEART_ICON from "../components/icons/HeartIcon";

type SearchResults = {
  artists: Array<{ id: string; name: string; imageUrl?: string | null }>;
  albums: Array<{
    id: string;
    title: string;
    coverUrl?: string | null;
    artist?: { name: string } | null;
  }>;
  tracks: Array<{
    id: string;
    title: string;
    durationSec: number;
    audioUrl: string;
    coverUrl?: string | null;
    artist?: { name: string } | null;
    album?: { coverUrl?: string | null } | null;
  }>;
};

type ExternalSearchResults = {
  itunes: {
    tracks: Array<{
      id: string;
      title: string;
      artistName?: string;
      albumName?: string;
      durationSec?: number;
      audioUrl?: string;
      coverUrl?: string;
      externalUrl?: string;
    }>;
    albums: Array<{
      id: string;
      title: string;
      artistName?: string;
      coverUrl?: string;
      externalUrl?: string;
    }>;
    artists: Array<{
      id: string;
      name: string;
      imageUrl?: string;
      externalUrl?: string;
    }>;
    podcasts: Array<{
      id: string;
      title: string;
      author?: string;
      coverUrl?: string;
      feedUrl?: string;
      externalUrl?: string;
    }>;
  };
  musicbrainz: {
    artists: Array<{
      id: string;
      name: string;
      externalUrl?: string;
    }>;
    albums: Array<{
      id: string;
      title: string;
      artistName?: string;
      externalUrl?: string;
    }>;
  };
  errors?: { itunes?: string; musicbrainz?: string };
};

type AudiusSearchResults = {
  tracks: Array<{
    id: string;
    title: string;
    artistName?: string;
    durationSec?: number;
    audioUrl: string;
    coverUrl?: string;
    externalUrl?: string;
  }>;
  artists: Array<{
    id: string;
    name: string;
    imageUrl?: string;
    externalUrl?: string;
  }>;
  playlists: Array<{
    id: string;
    title: string;
    ownerName?: string;
    coverUrl?: string;
    externalUrl?: string;
  }>;
};

const preventDefault = (event: { preventDefault: () => void }) => {
  event.preventDefault();
};

const linkProps = (href?: string) =>
  href
    ? { href, target: "_blank", rel: "noreferrer" }
    : { href: "#", onClick: preventDefault };

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [externalResults, setExternalResults] =
    useState<ExternalSearchResults | null>(null);
  const [externalStatus, setExternalStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [externalError, setExternalError] = useState<string | null>(null);
  const [audiusResults, setAudiusResults] =
    useState<AudiusSearchResults | null>(null);
  const [audiusStatus, setAudiusStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [audiusError, setAudiusError] = useState<string | null>(null);
  const { playQueue } = usePlayerStore();
  const { likedIds, toggleLike, isAuthenticated } = useLikedTracks();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const nextQuery = searchParams.get("q") ?? "";
    if (nextQuery !== query) {
      setQuery(nextQuery);
    }
  }, [query, searchParams]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setStatus("idle");
      setError(null);
      setExternalResults(null);
      setExternalStatus("idle");
      setExternalError(null);
      setAudiusResults(null);
      setAudiusStatus("idle");
      setAudiusError(null);
      return;
    }

    setStatus("loading");
    setError(null);
    setExternalStatus("loading");
    setExternalError(null);
    setAudiusStatus("loading");
    setAudiusError(null);
    const handle = window.setTimeout(() => {
      Promise.allSettled([
        apiFetch<SearchResults>(`/search?q=${encodeURIComponent(trimmed)}`),
        apiFetch<ExternalSearchResults>(
          `/search/external?q=${encodeURIComponent(trimmed)}`
        ),
        apiFetch<AudiusSearchResults>(
          `/audius/search?q=${encodeURIComponent(trimmed)}`
        ),
      ]).then(([localResult, externalResult, audiusResult]) => {
        if (localResult.status === "fulfilled") {
          setResults(localResult.value);
          setStatus("idle");
        } else {
          setResults(null);
          setStatus("error");
          setError(
            localResult.reason instanceof Error
              ? localResult.reason.message
              : "Search failed"
          );
        }

        if (externalResult.status === "fulfilled") {
          setExternalResults(externalResult.value);
          setExternalStatus("idle");
        } else {
          setExternalResults(null);
          setExternalStatus("error");
          setExternalError(
            externalResult.reason instanceof Error
              ? externalResult.reason.message
              : "Online search failed"
          );
        }

        if (audiusResult.status === "fulfilled") {
          setAudiusResults(audiusResult.value);
          setAudiusStatus("idle");
        } else {
          setAudiusResults(null);
          setAudiusStatus("error");
          setAudiusError(
            audiusResult.reason instanceof Error
              ? audiusResult.reason.message
              : "Audius search failed"
          );
        }
      });
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query]);

  const queueItems = results
    ? results.tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artistName: track.artist?.name,
        audioUrl: track.audioUrl,
        durationSec: track.durationSec,
        coverUrl: track.coverUrl ?? track.album?.coverUrl ?? undefined,
      }))
    : [];

  const itunesTracks = externalResults?.itunes.tracks ?? [];
  const itunesPreviewTracks = itunesTracks.filter((track) => !!track.audioUrl);
  const itunesAlbums = externalResults?.itunes.albums ?? [];
  const itunesArtists = externalResults?.itunes.artists ?? [];
  const itunesPodcasts = externalResults?.itunes.podcasts ?? [];
  const mbArtists = externalResults?.musicbrainz.artists ?? [];
  const mbAlbums = externalResults?.musicbrainz.albums ?? [];

  const audiusTracks = audiusResults?.tracks ?? [];
  const audiusArtists = audiusResults?.artists ?? [];
  const audiusPlaylists = audiusResults?.playlists ?? [];

  const audiusQueueItems = audiusTracks.map((track) => ({
    id: track.id,
    title: track.title,
    artistName: track.artistName,
    audioUrl: track.audioUrl,
    durationSec: track.durationSec ?? 0,
    coverUrl: track.coverUrl ?? undefined,
  }));

  const externalQueueItems = itunesPreviewTracks.map((track) => ({
    id: track.id,
    title: track.title,
    artistName: track.artistName,
    audioUrl: track.audioUrl ?? "",
    durationSec: track.durationSec ?? 0,
    coverUrl: track.coverUrl ?? undefined,
  }));

  const handlePlay = (index: number) => {
    playQueue(queueItems, index);
  };

  const handleExternalPlay = (index: number) => {
    playQueue(externalQueueItems, index);
  };

  const handleAudiusPlay = (index: number) => {
    playQueue(audiusQueueItems, index);
  };

  const handleAdd = (track: SearchResults["tracks"][number]) => {
    if (!isAuthenticated) {
      setError("Sign in to add tracks to playlists.");
      return;
    }
    setSelectedTrack({ id: track.id, title: track.title });
    setShowAdd(true);
  };

  const hasExternalResults =
    itunesPreviewTracks.length > 0 ||
    itunesAlbums.length > 0 ||
    itunesArtists.length > 0 ||
    itunesPodcasts.length > 0 ||
    mbArtists.length > 0 ||
    mbAlbums.length > 0;

  const hasAudiusResults =
    audiusTracks.length > 0 ||
    audiusArtists.length > 0 ||
    audiusPlaylists.length > 0;

  return (
    <>
      <section className="page-section">
        <div className="section-header">
          <div>
            <h2>Search</h2>
            <p className="section-subtitle">Find artists, albums, and tracks.</p>
          </div>
        </div>

        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search artists, albums, or tracks"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              if (value.trim()) {
                setSearchParams({ q: value }, { replace: true });
              } else {
                setSearchParams({}, { replace: true });
              }
            }}
          />
        </div>

        {status === "loading" && (
          <p className="section-subtitle">Searching your catalog...</p>
        )}
        {status === "error" && <p className="section-subtitle">{error}</p>}

        {results && status !== "error" && (
          <>
            <div className="page-section">
              <div className="section-header">
                <div>
                  <h2>Artists</h2>
                </div>
              </div>
              <div className="hero-grid">
                {results.artists.map((artist) => (
                  <a
                    key={artist.id}
                    className="hero-card"
                    href={`/artist/${artist.id}`}
                  >
                    <div
                      className="hero-art"
                      style={
                        artist.imageUrl
                          ? {
                              backgroundImage: `url(${artist.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    />
                    <div>
                      <div className="hero-title">{artist.name}</div>
                      <div className="hero-subtitle">Artist</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="page-section">
              <div className="section-header">
                <div>
                  <h2>Albums</h2>
                </div>
              </div>
              <div className="collection-grid">
                {results.albums.map((album, index) => (
                  <a
                    key={album.id}
                    className="collection-card"
                    href={`/album/${album.id}`}
                  >
                    <div
                      className={`collection-art tone-${index + 1}`}
                      style={
                        album.coverUrl
                          ? {
                              backgroundImage: `url(${album.coverUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    />
                    <div className="collection-title">{album.title}</div>
                    <div className="collection-meta">
                      {album.artist?.name ?? "Unknown artist"}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="page-section">
              <div className="section-header">
                <div>
                  <h2>Tracks</h2>
                </div>
              </div>
              {results.tracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  title={track.title}
                  artist={track.artist?.name}
                  duration={formatDuration(track.durationSec)}
                  onPlay={() => handlePlay(index)}
                  actions={
                    isAuthenticated
                      ? [
                          {
                            label: likedIds.has(track.id) ? "Unlike" : "Like",
                            onClick: () => toggleLike(track.id),
                            icon: HEART_ICON,
                            className: likedIds.has(track.id) ? "is-liked" : "",
                            pressed: likedIds.has(track.id),
                          },
                          {
                            label: "Add to playlist",
                            onClick: () => handleAdd(track),
                            icon: (
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  d="M12 5v14M5 12h14"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            ),
                          },
                        ]
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}

        {query.trim() && externalStatus === "loading" && (
          <p className="section-subtitle">Searching online catalogs...</p>
        )}
        {query.trim() && externalStatus === "error" && (
          <p className="section-subtitle">{externalError}</p>
        )}

        {query.trim() && audiusStatus === "loading" && (
          <p className="section-subtitle">Searching Audius...</p>
        )}
        {query.trim() && audiusStatus === "error" && (
          <p className="section-subtitle">{audiusError}</p>
        )}

        {query.trim() && audiusResults && (
          <div className="page-section">
            <div className="section-header">
              <div>
                <h2>Audius (full tracks)</h2>
                <p className="section-subtitle">Free full-length streaming.</p>
              </div>
            </div>

            {!hasAudiusResults && audiusStatus === "idle" && (
              <p className="section-subtitle">No Audius results yet.</p>
            )}

            {audiusTracks.length > 0 && (
              <div className="page-section">
                <div className="section-header">
                  <div>
                    <h2>Tracks (Audius)</h2>
                  </div>
                </div>
                {audiusTracks.map((track, index) => (
                  <TrackRow
                    key={track.id}
                    title={track.title}
                    artist={track.artistName}
                    duration={formatDuration(track.durationSec)}
                    onPlay={() => handleAudiusPlay(index)}
                    playLabel="Play"
                    actions={
                      track.externalUrl
                        ? [
                            {
                              label: "Open in Audius",
                              onClick: () =>
                                window.open(track.externalUrl, "_blank"),
                              icon: (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path
                                    d="M14 4h6v6M10 14 20 4M19 14v6H5V6h6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ),
                            },
                          ]
                        : undefined
                    }
                  />
                ))}
              </div>
            )}

            {audiusArtists.length > 0 && (
              <div className="page-section">
                <div className="section-header">
                  <div>
                    <h2>Artists (Audius)</h2>
                  </div>
                </div>
                <div className="hero-grid">
                  {audiusArtists.map((artist) => (
                    <a
                      key={artist.id}
                      className="hero-card"
                      {...linkProps(artist.externalUrl)}
                    >
                      <div
                        className="hero-art"
                        style={
                          artist.imageUrl
                            ? {
                                backgroundImage: `url(${artist.imageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      />
                      <div>
                        <div className="hero-title">{artist.name}</div>
                        <div className="hero-subtitle">Artist</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {audiusPlaylists.length > 0 && (
              <div className="page-section">
                <div className="section-header">
                  <div>
                    <h2>Playlists (Audius)</h2>
                  </div>
                </div>
                <div className="collection-grid">
                  {audiusPlaylists.map((playlist, index) => (
                    <a
                      key={playlist.id}
                      className="collection-card"
                      {...linkProps(playlist.externalUrl)}
                    >
                      <div
                        className={`collection-art tone-${index + 1}`}
                        style={
                          playlist.coverUrl
                            ? {
                                backgroundImage: `url(${playlist.coverUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      />
                      <div className="collection-title">{playlist.title}</div>
                      <div className="collection-meta">
                        {playlist.ownerName ?? "Unknown creator"}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {query.trim() && externalResults && (
          <>
            <div className="page-section">
              <div className="section-header">
                <div>
                  <h2>Online previews</h2>
                  <p className="section-subtitle">
                    Powered by iTunes Search and MusicBrainz.
                  </p>
                </div>
              </div>

              {!hasExternalResults && externalStatus === "idle" && (
                <p className="section-subtitle">No online results yet.</p>
              )}

              {itunesPreviewTracks.length > 0 && (
                <div className="page-section">
                  <div className="section-header">
                    <div>
                      <h2>Tracks (iTunes preview)</h2>
                    </div>
                  </div>
                  {itunesPreviewTracks.map((track, index) => (
                    <TrackRow
                      key={track.id}
                      title={track.title}
                      artist={track.artistName}
                      duration={formatDuration(track.durationSec)}
                      onPlay={() => handleExternalPlay(index)}
                      playLabel="Preview"
                    />
                  ))}
                </div>
              )}

              {itunesAlbums.length > 0 && (
                <div className="page-section">
                  <div className="section-header">
                    <div>
                      <h2>Albums (iTunes)</h2>
                    </div>
                  </div>
                  <div className="collection-grid">
                    {itunesAlbums.map((album, index) => (
                      <a
                        key={album.id}
                        className="collection-card"
                        {...linkProps(album.externalUrl)}
                      >
                        <div
                          className={`collection-art tone-${index + 1}`}
                          style={
                            album.coverUrl
                              ? {
                                  backgroundImage: `url(${album.coverUrl})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : undefined
                          }
                        />
                        <div className="collection-title">{album.title}</div>
                        <div className="collection-meta">
                          {album.artistName ?? "Unknown artist"}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {itunesArtists.length > 0 && (
                <div className="page-section">
                  <div className="section-header">
                    <div>
                      <h2>Artists (iTunes)</h2>
                    </div>
                  </div>
                  <div className="hero-grid">
                    {itunesArtists.map((artist) => (
                      <a
                        key={artist.id}
                        className="hero-card"
                        {...linkProps(artist.externalUrl)}
                      >
                        <div className="hero-art" />
                        <div>
                          <div className="hero-title">{artist.name}</div>
                          <div className="hero-subtitle">Artist</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {itunesPodcasts.length > 0 && (
                <div className="page-section">
                  <div className="section-header">
                    <div>
                      <h2>Podcasts (iTunes)</h2>
                    </div>
                  </div>
                  <div className="collection-grid">
                    {itunesPodcasts.map((podcast, index) => (
                      <a
                        key={podcast.id}
                        className="collection-card"
                        {...linkProps(podcast.externalUrl)}
                      >
                        <div
                          className={`collection-art tone-${index + 1}`}
                          style={
                            podcast.coverUrl
                              ? {
                                  backgroundImage: `url(${podcast.coverUrl})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : undefined
                          }
                        />
                        <div className="collection-title">{podcast.title}</div>
                        <div className="collection-meta">
                          {podcast.author ?? "Unknown host"}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {mbArtists.length > 0 && (
                <div className="page-section">
                  <div className="section-header">
                    <div>
                      <h2>Artists (MusicBrainz)</h2>
                    </div>
                  </div>
                  <div className="hero-grid">
                    {mbArtists.map((artist) => (
                      <a
                        key={artist.id}
                        className="hero-card"
                        {...linkProps(artist.externalUrl)}
                      >
                        <div className="hero-art" />
                        <div>
                          <div className="hero-title">{artist.name}</div>
                          <div className="hero-subtitle">Artist</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {mbAlbums.length > 0 && (
                <div className="page-section">
                  <div className="section-header">
                    <div>
                      <h2>Albums (MusicBrainz)</h2>
                    </div>
                  </div>
                  <div className="collection-grid">
                    {mbAlbums.map((album, index) => (
                      <a
                        key={album.id}
                        className="collection-card"
                        {...linkProps(album.externalUrl)}
                      >
                        <div className={`collection-art tone-${index + 1}`} />
                        <div className="collection-title">{album.title}</div>
                        <div className="collection-meta">
                          {album.artistName ?? "Unknown artist"}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>
      <AddToPlaylistModal
        open={showAdd}
        trackId={selectedTrack?.id ?? null}
        trackTitle={selectedTrack?.title ?? null}
        onClose={() => {
          setShowAdd(false);
          setSelectedTrack(null);
        }}
      />
    </>
  );
}
