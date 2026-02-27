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
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 21s-6.7-4.2-8.7-7.7A5.3 5.3 0 0 1 12 7.1a5.3 5.3 0 0 1 8.7 6.2C18.7 16.8 12 21 12 21z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button className="icon-button ghost" type="button" aria-label="More">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 12a2 2 0 1 0 0 .01V12zm6 0a2 2 0 1 0 0 .01V12zm6 0a2 2 0 1 0 0 .01V12z"
                fill="currentColor"
              />
            </svg>
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
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15 8a3 3 0 1 0-2.8-4H12a3 3 0 0 0 .2 1.1L8.7 7A3 3 0 0 0 6 6a3 3 0 1 0 2.7 4.1l3.5 2A3 3 0 1 0 15 16a3 3 0 0 0-2.7-1.1l-3.5-2A3 3 0 0 0 9 12a3 3 0 0 0-.3-1.1l3.5-2A3 3 0 0 0 15 8z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button className="icon-button ghost" type="button" aria-label="Add">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button className="icon-button ghost" type="button" aria-label="More">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 12a2 2 0 1 0 0 .01V12zm6 0a2 2 0 1 0 0 .01V12zm6 0a2 2 0 1 0 0 .01V12z"
                fill="currentColor"
              />
            </svg>
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
