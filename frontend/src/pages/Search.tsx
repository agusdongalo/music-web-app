import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import TrackRow from "../components/TrackRow";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";

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
  const { setTrack, setPlaying } = usePlayerStore();

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

  const handlePlay = (track: SearchResults["tracks"][number]) => {
    setTrack({
      id: track.id,
      title: track.title,
      artistName: track.artist?.name,
      audioUrl: track.audioUrl,
      durationSec: track.durationSec,
      coverUrl: track.coverUrl ?? track.album?.coverUrl ?? undefined,
    });
    setPlaying(true);
  };

  return (
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
            {results.tracks.map((track) => (
              <TrackRow
                key={track.id}
                title={track.title}
                artist={track.artist?.name}
                duration={formatDuration(track.durationSec)}
                onPlay={() => handlePlay(track)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
