import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import ArtistHeader from "../components/ArtistHeader";
import TrackRow from "../components/TrackRow";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";
import { useLikedTracks } from "../hooks/useLikedTracks";
import HEART_ICON from "../components/icons/HeartIcon";

type Artist = {
  id: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
  albums: Array<{ id: string; title: string; coverUrl?: string | null }>;
  tracks: Array<{
    id: string;
    title: string;
    durationSec: number;
    audioUrl: string;
    coverUrl?: string | null;
  }>;
};

export default function ArtistPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const { playQueue } = usePlayerStore();
  const { likedIds, toggleLike, isAuthenticated } = useLikedTracks();

  useEffect(() => {
    if (!id) {
      setStatus("error");
      setError("Missing artist id");
      return;
    }

    let active = true;
    setStatus("loading");
    apiFetch<Artist>(`/artists/${id}`)
      .then((data) => {
        if (!active) {
          return;
        }
        setArtist(data);
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

  const queueItems = artist
    ? artist.tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artistName: artist.name,
        audioUrl: track.audioUrl,
        durationSec: track.durationSec,
        coverUrl: track.coverUrl ?? undefined,
      }))
    : [];

  const handlePlay = (index: number) => {
    playQueue(queueItems, index);
  };

  if (status === "loading") {
    return (
      <section className="page-section">
        <p className="section-subtitle">Loading artist...</p>
      </section>
    );
  }

  if (status === "error" || !artist) {
    return (
      <section className="page-section">
        <p className="section-subtitle">{error ?? "Artist not found"}</p>
      </section>
    );
  }

  return (
    <section className="page-section">
      <ArtistHeader
        name={artist.name}
        bio={artist.bio ?? undefined}
        imageUrl={artist.imageUrl ?? undefined}
      />
      <div>
        <h3>Popular</h3>
        {artist.tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            title={track.title}
            artist={artist.name}
            duration={formatDuration(track.durationSec)}
            onPlay={() => handlePlay(index)}
            actions={
              isAuthenticated
                ? [
                    {
                      label: likedIds.has(track.id) ? "Unlike" : "Like",
                      onClick: () => toggleLike(track.id),
                      icon: HEART_ICON,
                      className: likedIds.has(track.id) ? "is-liked" : "",
                      pressed: likedIds.has(track.id),
                    },
                  ]
                : undefined
            }
          />
        ))}
      </div>

      <div className="page-section">
        <div className="section-header">
          <div>
            <h2>Albums</h2>
            <p className="section-subtitle">Latest releases.</p>
          </div>
        </div>
        <div className="collection-grid">
          {artist.albums.map((album, index) => (
            <Link
              key={album.id}
              className="collection-card"
              to={`/album/${album.id}`}
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
              <div className="collection-meta">Album</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
