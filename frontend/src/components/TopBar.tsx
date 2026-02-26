export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-nav">
          <button className="icon-button ghost" type="button" aria-label="Menu">
            ...
          </button>
          <button className="icon-button ghost" type="button" aria-label="Go back">
            {"<"}
          </button>
          <button className="icon-button ghost" type="button" aria-label="Go forward">
            {">"}
          </button>
          <button className="home-button" type="button" aria-label="Home">
            H
          </button>
        </div>
        <div className="search-field has-icon">
          <span className="search-icon" aria-hidden="true" />
          <input type="text" placeholder="What do you want to play?" />
        </div>
      </div>
      <div className="topbar-actions">
        <button className="button-pill" type="button">
          Explore Premium
        </button>
        <button className="icon-button ghost" type="button" aria-label="Notifications">
          N
        </button>
        <button className="icon-button ghost" type="button" aria-label="Friends">
          F
        </button>
        <div className="avatar">KS</div>
      </div>
    </header>
  );
}
