export default function NowPlayingPanel() {
  return (
    <aside className="now-panel">
      <div className="now-header">
        <span>Now Playing</span>
        <button className="icon-button" type="button">
          ...
        </button>
      </div>
      <div className="now-card">
        <div className="now-art" />
        <div className="now-info">
          <h3>Pahina</h3>
          <p>Cup of Joe</p>
        </div>
        <div className="now-actions">
          <button className="chip" type="button">
            Lyrics
          </button>
          <button className="chip" type="button">
            Queue
          </button>
          <button className="chip" type="button">
            Share
          </button>
        </div>
      </div>
      <div className="now-about">
        <span className="section-label">About the artist</span>
        <div className="about-card">
          <div className="about-image" />
          <div className="about-text">
            <h4>Cup of Joe</h4>
            <p>Quezon City. 1.2M monthly listeners.</p>
          </div>
        </div>
      </div>
      <div className="now-queue">
        <span className="section-label">Next in queue</span>
        <div className="queue-item">
          <div className="queue-thumb" />
          <div>
            <div className="queue-title">Midnight Drive</div>
            <div className="queue-artist">Neon Drift</div>
          </div>
        </div>
        <div className="queue-item">
          <div className="queue-thumb" />
          <div>
            <div className="queue-title">Silent Sanctuary</div>
            <div className="queue-artist">Acoustic Set</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
