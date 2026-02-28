import type { ReactNode } from "react";

type TrackRowProps = {
  title: string;
  artist?: string;
  duration?: string;
  playLabel?: string;
  onPlay?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    className?: string;
    pressed?: boolean;
  }>;
};

export default function TrackRow({
  title,
  artist,
  duration,
  playLabel,
  onPlay,
  actions,
}: TrackRowProps) {
  return (
    <div className="track-row">
      <button
        className="track-row-play button-primary"
        onClick={onPlay}
        type="button"
        disabled={!onPlay}
      >
        {playLabel ?? "Play"}
      </button>
      <div className="track-row-meta">
        <div className="track-row-title">{title}</div>
        <div className="track-row-artist">{artist ?? "Unknown artist"}</div>
      </div>
      <div className="track-row-actions">
        {actions?.map((action) => (
          <button
            key={action.label}
            className={`icon-button ghost track-row-action ${action.className ?? ""}`.trim()}
            type="button"
            aria-label={action.label}
            title={action.label}
            onClick={action.onClick}
            aria-pressed={action.pressed}
          >
            {action.icon ?? action.label}
          </button>
        ))}
        <div className="track-row-duration">{duration ?? "--:--"}</div>
      </div>
    </div>
  );
}
