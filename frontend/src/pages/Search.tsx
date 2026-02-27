import { useEffect, useState } from "react";
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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const { playQueue } = usePlayerStore();
  const { likedIds, toggleLike, isAuthenticated } = useLikedTracks();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setStatus("idle");
      setError(null);
      return;
    }

    setStatus("loading");
    const handle = window.setTimeout(() => {
      apiFetch<SearchResults>(`/search?q=${encodeURIComponent(trimmed)}`)
        .then((data) => {
          setResults(data);
          setStatus("idle");
        })
        .catch((err: Error) => {
          setError(err.message);
          setStatus("error");
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

  const handlePlay = (index: number) => {
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
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {status === "loading" && (
          <p className="section-subtitle">Searching...</p>
        )}
        {status === "error" && (
          <p className="section-subtitle">{error}</p>
        )}

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
