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
          <button className="icon-button ghost" type="button" aria-label="Shuffle">
            S
          </button>
          <button className="icon-button ghost" type="button" aria-label="Previous">
            {"<<"}
          </button>
          <button
            className="player-toggle button-primary"
            onClick={() => setPlaying(!isPlaying)}
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "||" : ">"}
          </button>
          <button className="icon-button ghost" type="button" aria-label="Next">
            {">>"}
          </button>
          <button className="icon-button ghost" type="button" aria-label="Repeat">
            R
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
        <button className="icon-button ghost" type="button" aria-label="Lyrics">
          L
        </button>
        <button className="icon-button ghost" type="button" aria-label="Queue">
          Q
        </button>
        <button className="icon-button ghost" type="button" aria-label="Devices">
          D
        </button>
        <div className="volume-bar">
          <div className="volume-fill" />
        </div>
      </div>
    </footer>
  );
}
