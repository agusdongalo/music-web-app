import { FormEvent, useState } from "react";
import { apiFetch } from "../api/client";

type PlaylistResponse = {
  id: string;
  name: string;
  isPublic: boolean;
  coverUrl?: string | null;
};

type CreatePlaylistModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (playlist: PlaylistResponse) => void;
};

export default function CreatePlaylistModal({
  open,
  onClose,
  onCreated,
}: CreatePlaylistModalProps) {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const playlist = await apiFetch<PlaylistResponse>("/playlists", {
        method: "POST",
        body: JSON.stringify({ name, isPublic }),
      });
      onCreated?.(playlist);
      setName("");
      setIsPublic(false);
      onClose();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to create playlist");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <div className="modal-header">
          <h3>Create playlist</h3>
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
        <form className="modal-body" onSubmit={handleSubmit}>
          <label className="modal-field">
            <span>Name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My new playlist"
            />
          </label>
          <label className="modal-checkbox">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
            />
            <span>Make public</span>
          </label>
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button className="button-secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="button-primary" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
