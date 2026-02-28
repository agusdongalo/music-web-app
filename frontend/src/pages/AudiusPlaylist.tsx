import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";


type AudiusTrackItem = {
  id: string;
  title: string;
  artistName?: string;
  durationSec?: number;
  audioUrl: string;
  coverUrl?: string;
};

type AudiusPlaylistDetail = {
  id: string;
  title: string;
  description?: string;
  ownerName?: string;
  coverUrl?: string;
  externalUrl?: string;
  trackCount?: number;
  playCount?: number;
  createdAt?: string;
};

function formatCount(count?: number) {
  if (!count && count !== 0) return "";
  return count.toLocaleString();
}

function formatTotalDuration(totalSeconds: number) {
  if (!totalSeconds || totalSeconds <= 0) return "";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

export default function AudiusPlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<AudiusPlaylistDetail | null>(null);
  const [tracks, setTracks] = useState<AudiusTrackItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const { playQueue } = usePlayerStore();

  useEffect(() => {
    if (!id) {
      navigate("/", { replace: true });
      return;
    }

    let active = true;
    setStatus("loading");
    setError(null);

    Promise.all([
      apiFetch<AudiusPlaylistDetail>(`/audius/playlists/${encodeURIComponent(id)}`),
      apiFetch<AudiusTrackItem[]>(
        `/audius/playlists/${encodeURIComponent(id)}/tracks`
      ),
    ])
      .then(([playlistResponse, tracksResponse]) => {
        if (!active) return;
        setPlaylist(playlistResponse);
        setTracks(tracksResponse);
        setStatus("idle");
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [id, navigate]);

  const queueItems = useMemo(
    () =>
      tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artistName: track.artistName,
        audioUrl: track.audioUrl,
        durationSec: track.durationSec ?? 0,
        coverUrl: track.coverUrl ?? undefined,
      })),
    [tracks]
  );

  const totalDuration = useMemo(
    () => tracks.reduce((sum, track) => sum + (track.durationSec ?? 0), 0),
    [tracks]
  );

  const handlePlay = (index = 0) => {
    playQueue(queueItems, index);
  };

  if (status === "error") {
    return (
      <section className="page-section">
        <h2>Playlist</h2>
        <p className="section-subtitle">{error}</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="playlist-hero">
        <div
          className="playlist-cover"
          style={
            playlist?.coverUrl
              ? {
                  backgroundImage: `url(${playlist.coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        <div className="playlist-meta">
          <span className="playlist-label">Public Playlist</span>
          <h1>{playlist?.title ?? "Playlist"}</h1>
          <p className="playlist-subtitle">
            {playlist?.ownerName ?? "Audius"}
            {playlist?.playCount
              ? ` · ${formatCount(playlist.playCount)} plays`
              : ""}
            {tracks.length ? ` · ${tracks.length} songs` : ""}
            {totalDuration ? ` · ${formatTotalDuration(totalDuration)}` : ""}
          </p>
          {playlist?.description && (
            <p className="playlist-description">{playlist.description}</p>
          )}
          <div className="playlist-actions">
            <button
              className="button-primary"
              type="button"
              onClick={() => handlePlay(0)}
              disabled={!queueItems.length}
            >
              Play
            </button>
            <button className="icon-button ghost" type="button" title="Shuffle">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M16 3h5v5M4 20l7-7M4 4l7 7M16 21h5v-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="icon-button ghost" type="button" title="More">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="playlist-table">
        <div className="playlist-header-row">
          <span>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span className="playlist-duration">Duration</span>
        </div>
        <div className="playlist-rows">
          {tracks.map((track, index) => (
            <button
              key={track.id}
              className="playlist-row"
              type="button"
              onClick={() => handlePlay(index)}
            >
              <span className="playlist-index">{index + 1}</span>
              <div className="playlist-title">
                <div className="playlist-track-title">{track.title}</div>
                <div className="playlist-track-meta">{track.artistName}</div>
              </div>
              <span className="playlist-artist">{track.artistName}</span>
              <span className="playlist-duration">
                {formatDuration(track.durationSec)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

