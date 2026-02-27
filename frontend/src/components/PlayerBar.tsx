import { useMemo } from "react";
import { usePlayerStore } from "../store/playerStore";
import { formatDuration } from "../utils/format";

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    setPlaying,
    setCurrentTime,
    setVolume,
    nextTrack,
    prevTrack,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore();

  const progress = useMemo(() => {
    if (!duration || duration <= 0) {
      return 0;
    }
    return Math.min(currentTime / duration, 1);
  }, [currentTime, duration]);

  const handleSeek = (value: number) => {
    if (!duration || duration <= 0) {
      return;
    }
    const nextTime = Math.max(0, Math.min(value, duration));
    setCurrentTime(nextTime);
  };

  return (
    <footer className="player-bar">
      <div className="player-meta">
        <div
          className="player-cover"
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
        <div>
          <div className="player-title">
            {currentTrack?.title ?? "No track selected"}
          </div>
          <div className="player-artist">
            {currentTrack?.artistName ?? "Select a track to play"}
          </div>
        </div>
      </div>
      <div className="player-controls">
        <div className="player-buttons">
          <button
            className="icon-button ghost player-button"
            type="button"
            aria-label="Shuffle"
            title="Shuffle"
            aria-pressed={shuffle}
            onClick={toggleShuffle}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline
                points="16 3 21 3 21 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="4"
                y1="20"
                x2="21"
                y2="3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="21 16 21 21 16 21"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="15"
                y1="15"
                x2="21"
                y2="21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="4"
                y1="4"
                x2="9"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            className="icon-button ghost player-button"
            type="button"
            aria-label="Previous"
            title="Previous"
            onClick={prevTrack}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polygon
                points="19 20 9 12 19 4 19 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <line
                x1="5"
                y1="19"
                x2="5"
                y2="5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            className="player-toggle button-primary"
            onClick={() => setPlaying(!isPlaying)}
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            disabled={!currentTrack?.audioUrl}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 5v14l12-7-12-7z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            className="icon-button ghost player-button"
            type="button"
            aria-label="Next"
            title="Next"
            onClick={nextTrack}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polygon
                points="5 4 15 12 5 20 5 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <line
                x1="19"
                y1="5"
                x2="19"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            className="icon-button ghost player-button"
            type="button"
            aria-label="Repeat"
            title="Repeat"
            aria-pressed={repeat !== "off"}
            onClick={cycleRepeat}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline
                points="17 1 21 5 17 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 11V9a4 4 0 0 1 4-4h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="7 23 3 19 7 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 13v2a4 4 0 0 1-4 4H3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="player-progress">
          <span className="player-time">{formatDuration(currentTime)}</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress * 100}%` }}
            />
            <input
              className="progress-input"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={duration ? currentTime : 0}
              onChange={(event) => handleSeek(Number(event.target.value))}
              disabled={!duration}
              aria-label="Seek"
            />
          </div>
          <span className="player-time">
            {duration ? formatDuration(duration) : "--:--"}
          </span>
        </div>
      </div>
      <div className="player-extras">
        <button
          className="icon-button ghost player-button"
          type="button"
          aria-label="Lyrics"
          title="Lyrics"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect
              x="4"
              y="5"
              width="16"
              height="14"
              rx="3"
              ry="3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="8"
              y1="10"
              x2="16"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="14"
              x2="14"
              y2="14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="icon-button ghost player-button"
          type="button"
          aria-label="Queue"
          title="Queue"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line
              x1="5"
              y1="7"
              x2="19"
              y2="7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="5"
              y1="17"
              x2="19"
              y2="17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="icon-button ghost player-button"
          type="button"
          aria-label="Devices"
          title="Devices"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect
              x="5"
              y="5"
              width="14"
              height="14"
              rx="2"
              ry="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="8"
              y="8"
              width="2"
              height="2"
              fill="currentColor"
            />
            <rect
              x="12"
              y="8"
              width="2"
              height="2"
              fill="currentColor"
            />
            <rect
              x="16"
              y="8"
              width="2"
              height="2"
              fill="currentColor"
            />
          </svg>
        </button>
        <div className="volume-bar volume-flat">
          <div
            className="volume-fill"
            style={{ width: `${Math.round(volume * 100)}%` }}
          />
          <input
            className="volume-input"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Volume"
          />
        </div>
      </div>
    </footer>
  );
}
