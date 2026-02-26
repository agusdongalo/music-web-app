import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import TrackRow from "../components/TrackRow";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";

type Album = {
  id: string;
  title: string;
  coverUrl?: string | null;
  releaseDate?: string | null;
  artist?: { name: string } | null;
  tracks: Array<{
    id: string;
    title: string;
    durationSec: number;
    audioUrl: string;
    coverUrl?: string | null;
  }>;
};

export default function AlbumPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const { setTrack, setPlaying } = usePlayerStore();

  useEffect(() => {
    if (!id) {
      setStatus("error");
      setError("Missing album id");
      return;
    }

    let active = true;
    setStatus("loading");
    apiFetch<Album>(`/albums/${id}`)
      .then((data) => {
        if (!active) {
          return;
        }
        setAlbum(data);
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
  }, [id]);

  const handlePlay = (track: Album["tracks"][number]) => {
    setTrack({
      id: track.id,
      title: track.title,
      artistName: album?.artist?.name,
      audioUrl: track.audioUrl,
      durationSec: track.durationSec,
      coverUrl: track.coverUrl ?? album?.coverUrl ?? undefined,
    });
    setPlaying(true);
  };

  if (status === "loading") {
    return (
      <section className="page-section">
        <p className="section-subtitle">Loading album...</p>
      </section>
    );
  }

  if (status === "error" || !album) {
    return (
      <section className="page-section">
        <p className="section-subtitle">{error ?? "Album not found"}</p>
      </section>
    );
  }

  const releaseYear = album.releaseDate
    ? new Date(album.releaseDate).getFullYear()
    : "";

  return (
    <section className="page-section">
      <div className="artist-header">
        <div className="artist-image">
          {album.coverUrl ? (
            <img src={album.coverUrl} alt={album.title} />
          ) : (
            <div />
          )}
        </div>
        <div>
          <h2>{album.title}</h2>
          <p>
            {album.artist?.name ?? "Unknown artist"}
            {releaseYear ? ` · ${releaseYear}` : ""}
          </p>
        </div>
      </div>

      <div>
        <h3>Tracks</h3>
        {album.tracks.map((track) => (
          <TrackRow
            key={track.id}
            title={track.title}
            artist={album.artist?.name}
            duration={formatDuration(track.durationSec)}
            onPlay={() => handlePlay(track)}
          />
        ))}
      </div>
    </section>
  );
}
