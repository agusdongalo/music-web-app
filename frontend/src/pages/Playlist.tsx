import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import TrackRow from "../components/TrackRow";
import { useAuthStore } from "../store/authStore";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";
import { useLikedTracks } from "../hooks/useLikedTracks";
import HEART_ICON from "../components/icons/HeartIcon";

type Playlist = {
  id: string;
  name: string;
  coverUrl?: string | null;
  userId?: string;
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
  const user = useAuthStore((state) => state.user);
  const { playQueue } = usePlayerStore();
  const { likedIds, toggleLike, isAuthenticated } = useLikedTracks();

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

  const queueItems = playlist
    ? playlist.items.map((item) => ({
        id: item.track.id,
        title: item.track.title,
        artistName: item.track.artist?.name,
        audioUrl: item.track.audioUrl,
        durationSec: item.track.durationSec,
        coverUrl: item.track.coverUrl ?? item.track.album?.coverUrl ?? undefined,
      }))
    : [];

  const handlePlay = (index: number) => {
    playQueue(queueItems, index);
  };

  const handleRemove = async (trackId: string) => {
    if (!playlist) {
      return;
    }
    try {
      await apiFetch(`/playlists/${playlist.id}/tracks/${trackId}`, {
        method: "DELETE",
      });
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((item) => item.track.id !== trackId),
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove track");
    }
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

  const isOwner = Boolean(user && playlist.userId === user.id);

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
          <p>{playlist.user?.displayName ?? user?.displayName ?? "Community"}</p>
        </div>
      </div>

      <div>
        <h3>Tracks</h3>
        {playlist.items.map((item, index) => {
          const actions = [] as Array<{
            label: string;
            onClick: () => void;
            icon?: JSX.Element;
            className?: string;
            pressed?: boolean;
          }>;

          if (isAuthenticated) {
            actions.push({
              label: likedIds.has(item.track.id) ? "Unlike" : "Like",
              onClick: () => toggleLike(item.track.id),
              icon: HEART_ICON,
              className: likedIds.has(item.track.id) ? "is-liked" : "",
              pressed: likedIds.has(item.track.id),
            });
          }

          if (isOwner) {
            actions.push({
              label: "Remove",
              onClick: () => handleRemove(item.track.id),
              icon: (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ),
            });
          }

          return (
            <TrackRow
              key={item.id}
              title={item.track.title}
              artist={item.track.artist?.name}
              duration={formatDuration(item.track.durationSec)}
              onPlay={() => handlePlay(index)}
              actions={actions.length ? actions : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
