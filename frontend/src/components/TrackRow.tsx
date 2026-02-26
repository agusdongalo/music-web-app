type TrackRowProps = {
  title: string;
  artist?: string;
  duration?: string;
  onPlay?: () => void;
};

export default function TrackRow({
  title,
  artist,
  duration,
  onPlay,
}: TrackRowProps) {
  return (
    <div className="track-row">
      <button
        className="track-row-play button-primary"
        onClick={onPlay}
        type="button"
        disabled={!onPlay}
      >
        Play
      </button>
      <div className="track-row-meta">
        <div className="track-row-title">{title}</div>
        <div className="track-row-artist">{artist ?? "Unknown artist"}</div>
      </div>
      <div className="track-row-duration">{duration ?? "--:--"}</div>
    </div>
  );
}
