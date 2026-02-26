const libraryItems = [
  {
    title: "Liked Songs",
    meta: "Playlist - 244 songs",
    tone: "liked",
    label: "LS",
  },
  {
    title: "Your Episodes",
    meta: "Podcast - Updated today",
    tone: "podcast",
    label: "YE",
  },
  {
    title: "Yearner Final Boss",
    meta: "Playlist - catchthy",
    tone: "chill",
    label: "YF",
  },
  {
    title: "Thirst Trap Pero English?",
    meta: "Playlist - yesh",
    tone: "liked",
    label: "TT",
  },
  {
    title: "Gym Phonk 2026",
    meta: "Playlist - magicmusicsquad",
    tone: "chill",
    label: "GP",
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Midnight Radio</h1>
        <button className="icon-button" type="button">
          +
        </button>
      </div>
      <nav className="sidebar-nav">
        <a href="/">Home</a>
        <a href="/search">Search</a>
        <a href="/library">Your Library</a>
      </nav>
      <div className="sidebar-section">
        <div className="sidebar-section-head">
          <span className="sidebar-label">Your Library</span>
          <button className="text-button" type="button">
            Recents
          </button>
        </div>
        <div className="chip-row">
          <button className="chip is-active" type="button">
            Playlists
          </button>
          <button className="chip" type="button">
            Podcasts
          </button>
          <button className="chip" type="button">
            Artists
          </button>
        </div>
      </div>
      <div className="sidebar-search">
        <input type="text" placeholder="Search in library" />
      </div>
      <div className="sidebar-list">
        {libraryItems.map((item) => (
          <button className="sidebar-item" type="button" key={item.title}>
            <div className={`item-cover ${item.tone}`}>{item.label}</div>
            <div>
              <div className="item-title">{item.title}</div>
              <div className="item-meta">{item.meta}</div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

