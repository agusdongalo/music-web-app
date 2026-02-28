import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import TrackRow from "./TrackRow";
import AddToPlaylistModal from "./AddToPlaylistModal";
import { useAuthStore } from "../store/authStore";
import { useLikedTracks } from "../hooks/useLikedTracks";
import { formatDuration } from "../utils/format";
import HEART_ICON from "./icons/HeartIcon";
import { usePlayerStore } from "../store/playerStore";

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

export default function TopBar() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const { likedIds, toggleLike, isAuthenticated } = useLikedTracks();
  const { playQueue } = usePlayerStore();
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "tracks" | "playlists" | "artists"
  >("all");
  const [historyIndex, setHistoryIndex] = useState(
    () => window.history.state?.idx ?? 0
  );
  const [maxHistoryIndex, setMaxHistoryIndex] = useState(
    () => window.history.state?.idx ?? 0
  );

  const [results, setResults] = useState<SearchResults | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [audiusResults, setAudiusResults] =
    useState<AudiusSearchResults | null>(null);
  const [audiusStatus, setAudiusStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [audiusError, setAudiusError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const idx = window.history.state?.idx ?? 0;
    setHistoryIndex(idx);
    setMaxHistoryIndex((prev) => (idx > prev ? idx : prev));
  }, [location.pathname, location.search]);

  useEffect(() => {
    const trimmed = searchText.trim();
    if (!trimmed) {
      setResults(null);
      setStatus("idle");
      setError(null);
      setAudiusResults(null);
      setAudiusStatus("idle");
      setAudiusError(null);
      setDropdownOpen(false);
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
  }, [searchText]);

  useEffect(() => {
    if (!dropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) {
        return;
      }
      const target = event.target as Node | null;
      if (target && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < maxHistoryIndex;

  const handleBack = () => {
    if (!canGoBack) return;
    navigate(-1);
  };

  const handleForward = () => {
    if (!canGoForward) return;
    navigate(1);
  };

  const handleHome = () => {
    navigate("/");
  };

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

  const handleAudiusPlay = (index: number) => {
    playQueue(audiusQueueItems, index);
  };

  const handleLocalPlay = (index: number) => {
    playQueue(queueItems, index);
  };

  const handleAdd = (track: SearchResults["tracks"][number]) => {
    if (!isAuthenticated) {
      setError("Sign in to add tracks to playlists.");
      return;
    }
    setSelectedTrack({ id: track.id, title: track.title });
    setShowAdd(true);
  };

  const showAll = filter === "all";
  const showTracks = filter === "all" || filter === "tracks";
  const showPlaylists = filter === "all" || filter === "playlists";
  const showArtists = filter === "all" || filter === "artists";

  const hasLocalResults =
    !!results &&
    ((showTracks && results.tracks.length > 0) ||
      (showArtists && results.artists.length > 0));

  const hasAudiusResults =
    (showTracks && audiusTracks.length > 0) ||
    (showPlaylists && audiusPlaylists.length > 0) ||
    (showArtists && audiusArtists.length > 0);

  const showDropdown = dropdownOpen && searchText.trim().length > 0;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-nav">
          <button
            className="icon-button ghost"
            type="button"
            aria-label="Go back"
            title="Back"
            onClick={handleBack}
            disabled={!canGoBack}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M14.5 6 8.5 12l6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="icon-button ghost"
            type="button"
            aria-label="Go forward"
            title="Forward"
            onClick={handleForward}
            disabled={!canGoForward}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9.5 6 15.5 12l-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="home-button"
            type="button"
            aria-label="Home"
            title="Home"
            onClick={handleHome}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="search-dropdown" ref={dropdownRef}>
          <form className="search-field" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="What do you want to play?"
              value={searchText}
              onFocus={() => setDropdownOpen(true)}
              onChange={(event) => {
                const value = event.target.value;
                setSearchText(value);
                setDropdownOpen(Boolean(value.trim()));
              }}
            />
          </form>
          {showDropdown && (
            <div className="search-dropdown-panel">
              <div className="filter-row search-filter-row">
                <button
                  className={`chip ${filter === "all" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  className={`chip ${filter === "tracks" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setFilter("tracks")}
                >
                  Songs
                </button>
                <button
                  className={`chip ${filter === "playlists" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setFilter("playlists")}
                >
                  Playlists
                </button>
                <button
                  className={`chip ${filter === "artists" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setFilter("artists")}
                >
                  Artists
                </button>
              </div>
              {status === "loading" && (
                <p className="section-subtitle">Searching your catalog...</p>
              )}
              {status === "error" && (
                <p className="section-subtitle">{error}</p>
              )}

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

                  {showTracks && audiusTracks.length > 0 && (
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

                  {showPlaylists && audiusPlaylists.length > 0 && (
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

                  {showArtists && audiusArtists.length > 0 && (
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

                  {showTracks && results.tracks.length > 0 && (
                    <div className="page-section">
                      <h4 className="search-dropdown-subtitle">Tracks</h4>
                      {results.tracks.map((track, index) => (
                        <TrackRow
                          key={track.id}
                          title={track.title}
                          artist={track.artist?.name}
                          duration={formatDuration(track.durationSec)}
                          onPlay={() => handleLocalPlay(index)}
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

                  {showArtists && results.artists.length > 0 && (
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
        <button className="button-primary topbar-cta" type="button">
          Explore Premium
        </button>
        {token ? (
          <>
            <div className="avatar">{user?.displayName?.[0] ?? "U"}</div>
            <button className="button-secondary" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="text-button" to="/login">
              Login
            </Link>
            <Link className="button-secondary" to="/register">
              Sign up
            </Link>
          </>
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
    </header>
  );
}
