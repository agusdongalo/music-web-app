import { useState } from "react";
import { usePlayerStore } from "../store/playerStore";
import { useLikedTracks } from "../hooks/useLikedTracks";
import HEART_ICON from "./icons/HeartIcon";

const isAudiusUrl = (url?: string) =>
  Boolean(url && url.includes("audius.co"));

export default function NowPlayingPanel() {
  const { currentTrack, queue, currentIndex, playQueue } = usePlayerStore();
  const { likedIds, toggleLike, isAuthenticated } = useLikedTracks();
  const [panelTab, setPanelTab] = useState<"about" | "queue">("about");
  const isAudiusTrack = isAudiusUrl(currentTrack?.audioUrl);
  const canLike = Boolean(currentTrack?.id) && isAuthenticated && !isAudiusTrack;
  const isLiked = Boolean(currentTrack?.id && likedIds.has(currentTrack.id));

  const nowTitle = currentTrack?.title ?? "No track selected";
  const nowArtist = currentTrack?.artistName ?? "Select a track to play";
  const aboutTitle = currentTrack?.artistName ?? "Unknown artist";
  const aboutMeta = currentTrack?.audioUrl
    ? `Source: ${isAudiusTrack ? "Audius" : "Library"}`
    : "Pick a track to see details.";

  const hasQueue = queue.length > 0;
  const showQueue = panelTab === "queue";

  return (
    <aside className="now-panel">
      <div className="now-header">
        <div className="now-header-left">
          <span className="now-header-badge">NP</span>
          <span className="now-header-title">{nowTitle}</span>
        </div>
        <div className="now-header-actions">
          <button
            className={`icon-button ghost ${isLiked ? "is-liked" : ""}`.trim()}
            type="button"
            aria-label={isLiked ? "Unlike" : "Like"}
            title={
              isAudiusTrack
                ? "Likes are available for library tracks only"
                : "Like"
            }
            aria-pressed={isLiked}
            disabled={!canLike}
            onClick={() => {
              if (currentTrack?.id) {
                toggleLike(currentTrack.id);
              }
            }}
          >
            {HEART_ICON}
          </button>
          <button
            className="icon-button ghost"
            type="button"
            aria-label="More"
            disabled={!currentTrack}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 12a2 2 0 1 0 0 .01V12zm6 0a2 2 0 1 0 0 .01V12zm6 0a2 2 0 1 0 0 .01V12z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="now-card">
        <div
          className="now-art"
          style={
            currentTrack?.coverUrl
              ? {
                  backgroundImage: `url(${currentTrack.coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        <div className="now-info">
          <h3>{nowTitle}</h3>
          <p>{nowArtist}</p>
        </div>
        <div className="now-actions">
          <button
            className="icon-button ghost"
            type="button"
            aria-label="Share"
            disabled={!currentTrack?.audioUrl}
            title="Share (coming soon)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15 8a3 3 0 1 0-2.8-4H12a3 3 0 0 0 .2 1.1L8.7 7A3 3 0 0 0 6 6a3 3 0 1 0 2.7 4.1l3.5 2A3 3 0 1 0 15 16a3 3 0 0 0-2.7-1.1l-3.5-2A3 3 0 0 0 9 12a3 3 0 0 0-.3-1.1l3.5-2A3 3 0 0 0 15 8z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            className="icon-button ghost"
            type="button"
            aria-label="Add"
            disabled={!currentTrack || isAudiusTrack || !isAuthenticated}
            title={
              isAudiusTrack
                ? "Add to playlist is available for library tracks only"
                : "Add to playlist"
            }
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            className="icon-button ghost"
            type="button"
            aria-label="More"
            disabled={!currentTrack}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 12a2 2 0 1 0 0 .01V12zm6 0a2 2 0 1 0 0 .01V12zm6 0a2 2 0 1 0 0 .01V12z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="chip-row now-toggle">
        <button
          className={`chip ${panelTab === "about" ? "is-active" : ""}`}
          type="button"
          onClick={() => setPanelTab("about")}
        >
          About
        </button>
        <button
          className={`chip ${panelTab === "queue" ? "is-active" : ""}`}
          type="button"
          onClick={() => setPanelTab("queue")}
          disabled={!hasQueue}
        >
          Queue
        </button>
      </div>
      {showQueue ? (
        <div className="now-queue">
          <span className="section-label">Up next</span>
          {queue.length === 0 ? (
            <p className="section-subtitle">Queue is empty.</p>
          ) : (
            queue.map((track, index) => (
              <button
                key={track.id}
                className={`queue-item ${index === currentIndex ? "is-active" : ""}`.trim()}
                type="button"
                onClick={() => playQueue(queue, index)}
              >
                <div
                  className="queue-thumb"
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
                  <div className="queue-title">{track.title}</div>
                  <div className="queue-artist">
                    {track.artistName ?? "Unknown artist"}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="now-about">
          <span className="section-label">About the artist</span>
          <div className="about-card">
            <div
              className="about-image"
              style={
                currentTrack?.coverUrl
                  ? {
                      backgroundImage: `url(${currentTrack.coverUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            />
            <div className="about-text">
              <h4>{aboutTitle}</h4>
              <p>{aboutMeta}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
