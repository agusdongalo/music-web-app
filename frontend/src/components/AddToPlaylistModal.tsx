import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

type Playlist = {
  id: string;
  name: string;
};

type AddToPlaylistModalProps = {
  open: boolean;
  trackId: string | null;
  trackTitle?: string | null;
  onClose: () => void;
};

export default function AddToPlaylistModal({
  open,
  trackId,
  trackTitle,
  onClose,
}: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setError(null);
    setStatus("loading");
    apiFetch<Playlist[]>("/playlists")
      .then((data) => {
        setPlaylists(data);
        setStatus("idle");
      })
      .catch((err: Error) => {
        setError(err.message);
        setStatus("error");
      });
  }, [open]);

  if (!open) {
    return null;
  }

  const handleAdd = async (playlistId: string) => {
    if (!trackId) {
      return;
    }
    try {
      await apiFetch(`/playlists/${playlistId}/tracks`, {
        method: "POST",
        body: JSON.stringify({ trackId }),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add track");
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <div className="modal-header">
          <h3>Add to playlist</h3>
          <button className="icon-button ghost" type="button" onClick={onClose}>
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
          </button>
        </div>
        <div className="modal-body">
          <p className="section-subtitle">
            {trackTitle ? `Track: ${trackTitle}` : "Choose a playlist"}
          </p>
          {status === "loading" && (
            <p className="section-subtitle">Loading playlists...</p>
          )}
          {status === "error" && <p className="modal-error">{error}</p>}
          {status === "idle" && playlists.length === 0 && (
            <p className="section-subtitle">No playlists yet.</p>
          )}
          <div className="modal-list">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="modal-list-item"
                type="button"
                onClick={() => handleAdd(playlist.id)}
              >
                {playlist.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
