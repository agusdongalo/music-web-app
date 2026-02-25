import { usePlayerStore } from "../store/playerStore";

export default function QueueDrawer() {
  const { queue } = usePlayerStore();

  return (
    <aside className="queue-drawer">
      <h3>Up Next</h3>
      {queue.length === 0 ? (
        <p>No tracks queued.</p>
      ) : (
        <ul>
          {queue.map((track) => (
            <li key={track.id}>{track.title}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}
