import { usePlayerStore } from "../store/playerStore";

export default function PlayerBar() {
  const { currentTrack, isPlaying, setPlaying } = usePlayerStore();

  return (
    <footer className="player-bar">
      <div className="player-meta">
        <div className="player-cover" />
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
          <button className="icon-button" type="button">
            Prev
          </button>
          <button
            className="player-toggle button-primary"
            onClick={() => setPlaying(!isPlaying)}
            type="button"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button className="icon-button" type="button">
            Next
          </button>
        </div>
        <div className="player-progress">
          <span className="player-time">3:53</span>
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
          <span className="player-time">4:09</span>
        </div>
      </div>
      <div className="player-extras">
        <button className="icon-button" type="button">
          Queue
        </button>
        <div className="volume-bar">
          <div className="volume-fill" />
        </div>
      </div>
    </footer>
  );
}
