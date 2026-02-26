export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-nav">
          <button className="icon-button" type="button" aria-label="Go back">
            {"<"}
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Go forward"
          >
            {">"}
          </button>
        </div>
        <div className="search-field">
          <input type="text" placeholder="What do you want to play?" />
        </div>
      </div>
      <div className="topbar-actions">
        <button className="button-primary topbar-cta" type="button">
          Explore Premium
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="Notifications"
        >
          N
        </button>
        <div className="avatar">KS</div>
      </div>
    </header>
  );
}
