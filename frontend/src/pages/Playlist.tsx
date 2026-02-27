import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import TrackRow from "../components/TrackRow";
import { useAuthStore } from "../store/authStore";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";

type Playlist = {
  id: string;
  name: string;
  coverUrl?: string | null;
  user?: { displayName: string } | null;
  items: Array<{
    id: string;
    position: number;
    track: {
      id: string;
      title: string;
      durationSec: number;
      audioUrl: string;
      coverUrl?: string | null;
      artist?: { name: string } | null;
      album?: { coverUrl?: string | null } | null;
    };
  }>;
};

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);
  const { setTrack, setPlaying } = usePlayerStore();

  useEffect(() => {
    if (!id) {
      setStatus("error");
      setError("Missing playlist id");
      return;
    }

    let active = true;
    setStatus("loading");

    const endpoint = token ? `/playlists/${id}` : `/playlists/public/${id}`;

    apiFetch<Playlist>(endpoint)
      .then((data) => {
        if (!active) {
          return;
        }
        setPlaylist(data);
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
  }, [id, token]);

  const handlePlay = (track: Playlist["items"][number]["track"]) => {
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

  if (status === "loading") {
    return (
      <section className="page-section">
        <p className="section-subtitle">Loading playlist...</p>
      </section>
    );
  }

  if (status === "error" || !playlist) {
    return (
      <section className="page-section">
        <p className="section-subtitle">{error ?? "Playlist not found"}</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="artist-header">
        <div className="artist-image">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.name} />
          ) : (
            <div />
          )}
        </div>
        <div>
          <h2>{playlist.name}</h2>
          <p>{playlist.user?.displayName ?? "Community"}</p>
        </div>
      </div>

      <div>
        <h3>Tracks</h3>
        {playlist.items.map((item) => (
          <TrackRow
            key={item.id}
            title={item.track.title}
            artist={item.track.artist?.name}
            duration={formatDuration(item.track.durationSec)}
            onPlay={() => handlePlay(item.track)}
          />
        ))}
      </div>
    </section>
  );
}
