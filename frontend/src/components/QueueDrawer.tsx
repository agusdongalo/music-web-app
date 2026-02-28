import { usePlayerStore } from "../store/playerStore";

type QueueDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function QueueDrawer({ open, onClose }: QueueDrawerProps) {
  const { queue, playQueue, currentIndex } = usePlayerStore();

  if (!open) {
    return null;
  }

  return (
    <aside className="queue-drawer" role="dialog" aria-modal="true">
      <div className="queue-drawer-header">
        <div>
          <div className="queue-drawer-label">Queue</div>
          <h3>Up Next</h3>
        </div>
        <button
          className="icon-button ghost"
          type="button"
          onClick={onClose}
          aria-label="Close queue"
        >
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
      {queue.length === 0 ? (
        <p className="section-subtitle">No tracks queued.</p>
      ) : (
        <div className="queue-drawer-list">
          {queue.map((track, index) => (
            <button
              key={track.id}
              className={`queue-drawer-item ${index === currentIndex ? "is-active" : ""}`.trim()}
              type="button"
              onClick={() => playQueue(queue, index)}
            >
              <div className="queue-drawer-title">{track.title}</div>
              <div className="queue-drawer-artist">
                {track.artistName ?? "Unknown artist"}
              </div>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
