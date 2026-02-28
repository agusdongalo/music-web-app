import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
      setAudiusResults(null);
      setAudiusStatus("idle");
      setAudiusError(null);
      return;
    }

    setStatus("loading");
    setError(null);
    setAudiusStatus("loading");
    setAudiusError(null);
    const handle = window.setTimeout(() => {
      Promise.allSettled([
        apiFetch<SearchResults>(`/search?q=${encodeURIComponent(trimmed)}`),
        apiFetch<AudiusSearchResults>(
          `/audius/search?q=${encodeURIComponent(trimmed)}`
        ),
      ]).then(([localResult, audiusResult]) => {
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

  const handlePlay = (index: number) => {
    playQueue(queueItems, index);
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

  const hasLocalResults =
    !!results &&
    (results.tracks.length > 0 || results.artists.length > 0);

  const hasAudiusResults =
    audiusTracks.length > 0 ||
    audiusArtists.length > 0 ||
    audiusPlaylists.length > 0;

  const showDropdown = query.trim().length > 0;

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h2>Search</h2>
          <p className="section-subtitle">Find artists and tracks.</p>
        </div>
      </div>

      <div className="search-dropdown">
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search artists or tracks"
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

        {showDropdown && (
          <div className="search-dropdown-panel">
            {status === "loading" && (
              <p className="section-subtitle">Searching your catalog...</p>
            )}
            {status === "error" && <p className="section-subtitle">{error}</p>}

            {audiusStatus === "loading" && (
              <p className="section-subtitle">Searching Audius...</p>
            )}
            {audiusStatus === "error" && (
              <p className="section-subtitle">{audiusError}</p>
            )}

            {!hasLocalResults &&
              !hasAudiusResults &&
              status === "idle" &&
              audiusStatus === "idle" && (
                <p className="section-subtitle">No results yet.</p>
              )}

            {hasAudiusResults && (
              <div className="search-dropdown-block">
                <h3 className="search-dropdown-title">Audius</h3>

                {audiusTracks.length > 0 && (
                  <div className="page-section">
                    <h4 className="search-dropdown-subtitle">Tracks</h4>
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

                {audiusPlaylists.length > 0 && (
                  <div className="page-section">
                    <h4 className="search-dropdown-subtitle">Playlists</h4>
                    <div className="collection-grid">
                      {audiusPlaylists.map((playlist, index) => (
                        <Link
                          key={playlist.id}
                          className="collection-card"
                          to={`/audius/playlist/${playlist.id}`}
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
                          <div className="collection-title">
                            {playlist.title}
                          </div>
                          <div className="collection-meta">
                            {playlist.ownerName ?? "Unknown creator"}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {audiusArtists.length > 0 && (
                  <div className="page-section">
                    <h4 className="search-dropdown-subtitle">Artists</h4>
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
              </div>
            )}

            {hasLocalResults && results && (
              <div className="search-dropdown-block">
                <h3 className="search-dropdown-title">Your Library</h3>

                {results.tracks.length > 0 && (
                  <div className="page-section">
                    <h4 className="search-dropdown-subtitle">Tracks</h4>
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
                                  label: likedIds.has(track.id)
                                    ? "Unlike"
                                    : "Like",
                                  onClick: () => toggleLike(track.id),
                                  icon: HEART_ICON,
                                  className: likedIds.has(track.id)
                                    ? "is-liked"
                                    : "",
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
                )}

                {results.artists.length > 0 && (
                  <div className="page-section">
                    <h4 className="search-dropdown-subtitle">Artists</h4>
                    <div className="hero-grid">
                      {results.artists.map((artist) => (
                        <Link
                          key={artist.id}
                          className="hero-card"
                          to={`/artist/${artist.id}`}
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
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AddToPlaylistModal
        open={showAdd}
        trackId={selectedTrack?.id ?? null}
        trackTitle={selectedTrack?.title ?? null}
        onClose={() => {
          setShowAdd(false);
          setSelectedTrack(null);
        }}
      />
    </section>
  );
}
