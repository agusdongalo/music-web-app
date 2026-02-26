export default function NowPlayingPanel() {
  return (
    <aside className="now-panel">
      <div className="now-header">
        <div className="now-header-left">
          <span className="now-header-badge">[]</span>
          <span className="now-header-title">Pahina</span>
        </div>
        <div className="now-header-actions">
          <button className="icon-button ghost" type="button" aria-label="Like">
            +
          </button>
          <button className="icon-button ghost" type="button" aria-label="More">
            ...
          </button>
        </div>
      </div>
      <div className="now-card">
        <div className="now-art" />
        <div className="now-info">
          <h3>Pahina</h3>
          <p>Cup of Joe</p>
        </div>
        <div className="now-actions">
          <button className="icon-button ghost" type="button" aria-label="Share">
            S
          </button>
          <button className="icon-button ghost" type="button" aria-label="Add">
            +
          </button>
          <button className="icon-button ghost" type="button" aria-label="More">
            ...
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
    </aside>
  );
}
