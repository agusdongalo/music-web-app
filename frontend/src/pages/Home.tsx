import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";

type Track = {
  id: string;
  title: string;
  durationSec: number;
  audioUrl: string;
  coverUrl?: string | null;
  artist?: { name: string } | null;
  album?: { coverUrl?: string | null } | null;
};

type Album = {
  id: string;
  title: string;
  coverUrl?: string | null;
  artist?: { name: string } | null;
};

type Playlist = {
  id: string;
  name: string;
  coverUrl?: string | null;
  user?: { displayName: string } | null;
  _count?: { items: number } | null;
};

export default function HomePage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const { setTrack, setPlaying } = usePlayerStore();

  useEffect(() => {
    let active = true;
    setStatus("loading");

    Promise.all([
      apiFetch<Track[]>("/tracks?limit=6"),
      apiFetch<Album[]>("/albums"),
      apiFetch<Playlist[]>("/playlists/public?limit=4"),
    ])
      .then(([tracksResponse, albumsResponse, playlistsResponse]) => {
        if (!active) {
          return;
        }
        setTracks(tracksResponse);
        setAlbums(albumsResponse.slice(0, 4));
        setPlaylists(playlistsResponse.slice(0, 4));
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

  const handlePlay = (track: Track) => {
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
            {tracks.map((track) => (
              <button
                key={track.id}
                className="hero-card glow"
                type="button"
                onClick={() => handlePlay(track)}
              >
                <div
                  className="hero-art"
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
                <div>
                  <div className="hero-title">{track.title}</div>
                  <div className="hero-subtitle">
                    {track.artist?.name ?? "Unknown"} · {formatDuration(
                      track.durationSec
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="page-section">
        <div className="section-header compact">
          <div>
            <span className="section-label">Made for</span>
            <h2>donlicioso</h2>
            <p className="section-subtitle">
              Fresh picks tuned to your midnight rotation.
            </p>
          </div>
          <button className="text-button" type="button">
            Show all
          </button>
        </div>
        <div className="collection-grid">
          {albums.map((album, index) => (
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
      </section>

      <section className="page-section">
        <div className="section-header">
          <div>
            <h2>Late night picks</h2>
            <p className="section-subtitle">Stay locked in with neon calm.</p>
          </div>
          <button className="text-button" type="button">
            Browse
          </button>
        </div>
        <div className="collection-grid">
          {playlists.map((playlist, index) => (
            <a
              key={playlist.id}
              className="collection-card"
              href={`/playlist/${playlist.id}`}
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
              <div className="collection-title">{playlist.name}</div>
              <div className="collection-meta">
                {playlist.user?.displayName ?? "Community"}
                {playlist._count?.items
                  ? ` · ${playlist._count.items} tracks`
                  : ""}
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
