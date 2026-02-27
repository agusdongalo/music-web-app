import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import TrackRow from "../components/TrackRow";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";

type Track = {
  id: string;
  title: string;
  durationSec: number;
  audioUrl: string;
  artist?: { name: string } | null;
  album?: { coverUrl?: string | null } | null;
  coverUrl?: string | null;
};

type Playlist = {
  id: string;
  name: string;
  coverUrl?: string | null;
  isPublic?: boolean;
};

export default function LibraryPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
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
      apiFetch<Track[]>("/me/liked-tracks"),
      apiFetch<Playlist[]>("/playlists"),
    ])
      .then(([tracksResponse, playlistsResponse]) => {
        if (!active) {
          return;
        }
        setTracks(tracksResponse);
        setPlaylists(playlistsResponse);
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
        <h2>Your Library</h2>
        <p className="section-subtitle">{error}</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h2>Your Library</h2>
          <p className="section-subtitle">Your saved tracks and playlists.</p>
        </div>
      </div>

      {status === "loading" ? (
        <p className="section-subtitle">Loading your picks...</p>
      ) : (
        <>
          <div>
            <h3>Liked tracks</h3>
            {tracks.length === 0 ? (
              <p className="section-subtitle">No liked tracks yet.</p>
            ) : (
              tracks.map((track) => (
                <TrackRow
                  key={track.id}
                  title={track.title}
                  artist={track.artist?.name}
                  duration={formatDuration(track.durationSec)}
                  onPlay={() => handlePlay(track)}
                />
              ))
            )}
          </div>

          <div className="page-section">
            <div className="section-header">
              <div>
                <h2>Your playlists</h2>
                <p className="section-subtitle">Curated by you.</p>
              </div>
            </div>
            <div className="collection-grid">
              {playlists.length === 0 ? (
                <p className="section-subtitle">No playlists yet.</p>
              ) : (
                playlists.map((playlist, index) => (
                  <a
                    key={playlist.id}
                    className="collection-card"
                    href={`/playlist/${playlist.id}`}
                  >
                    <div
                      className={`collection-art tone-${(index % 4) + 1}`}
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
                      {playlist.isPublic ? "Public" : "Private"}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
