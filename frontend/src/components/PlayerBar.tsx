import { usePlayerStore } from "../store/playerStore";

export default function PlayerBar() {
  const { currentTrack, isPlaying, setPlaying } = usePlayerStore();

  return (
    <footer className="player-bar">
      <div className="player-meta">
        <div className="player-title">
          {currentTrack?.title ?? "No track selected"}
        </div>
        <div className="player-artist">
          {currentTrack?.artistName ?? "Select a track to play"}
        </div>
      </div>
      <button
        className="player-toggle"
        onClick={() => setPlaying(!isPlaying)}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </footer>
  );
}
