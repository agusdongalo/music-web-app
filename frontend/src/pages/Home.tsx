import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";

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

export default function HomePage() {
  const [tracks, setTracks] = useState<AudiusSearchResults["tracks"]>([]);
  const [artists, setArtists] = useState<AudiusSearchResults["artists"]>([]);
  const [playlists, setPlaylists] = useState<AudiusSearchResults["playlists"]>(
    []
  );
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const { playQueue } = usePlayerStore();

  useEffect(() => {
    let active = true;
    setStatus("loading");

    apiFetch<AudiusSearchResults>("/audius/search?q=opm&limit=12")
      .then((data) => {
        if (!active) {
          return;
        }
        setTracks(data.tracks.slice(0, 6));
        setArtists(data.artists.slice(0, 4));
        setPlaylists(data.playlists.slice(0, 6));
        setStatus("idle");
      })
      .catch((err: Error) => {
        if (!active) {
          return;
        }
        setError(err.message);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const queueItems = tracks.map((track) => ({
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

  if (status === "error") {
    return (
      <section className="page-section">
        <h2>Made for you</h2>
        <p className="section-subtitle">{error}</p>
      </section>
    );
  }

  return (
    <>
      <section className="page-section hero-section">
        <div className="filter-row">
          <button className="chip is-active" type="button">
            All
          </button>
          <button className="chip" type="button">
            Music
          </button>
          <button className="chip" type="button">
            Podcasts
          </button>
        </div>
        {status === "loading" ? (
          <p className="section-subtitle">Loading picks...</p>
        ) : (
          <div className="hero-grid stagger">
            {playlists.map((playlist) => (
              <Link
                key={playlist.id}
                className="hero-card glow"
                to={`/audius/playlist/${playlist.id}`}
              >
                <div
                  className="hero-art"
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
                <div className="hero-meta">
                  <div className="hero-title">{playlist.title}</div>
                  <div className="hero-subtitle">
                    {playlist.ownerName ?? "Audius"} · Playlist
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="page-section">
        <div className="section-header compact">
          <div>
            <span className="section-label">Made for</span>
            <h2>donlicioso</h2>
            <p className="section-subtitle">Fresh Audius picks for tonight.</p>
          </div>
          <button className="text-button" type="button">
            Show all
          </button>
        </div>
        <div className="collection-grid">
          {tracks.map((track, index) => (
            <button
              key={track.id}
              className="collection-card"
              type="button"
              onClick={() => handlePlay(index)}
            >
              <div
                className={`collection-art tone-${index + 1}`}
                style={
                  track.coverUrl
                    ? {
                        backgroundImage: `url(${track.coverUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
              <div className="collection-title">{track.title}</div>
              <div className="collection-meta">
                {track.artistName ?? "Unknown artist"} · {formatDuration(
                  track.durationSec
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-header">
          <div>
            <h2>Discover artists</h2>
            <p className="section-subtitle">Explore the Audius community.</p>
          </div>
          <button className="text-button" type="button">
            Browse
          </button>
        </div>
        <div className="collection-grid">
          {artists.map((artist, index) => (
            <a
              key={artist.id}
              className="collection-card"
              {...linkProps(artist.externalUrl)}
            >
              <div
                className={`collection-art tone-${index + 1}`}
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
              <div className="collection-title">{artist.name}</div>
              <div className="collection-meta">Artist</div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
