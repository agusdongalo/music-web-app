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
      <div className="library-header">
        <h2 className="library-title">Your Library</h2>
        <div className="library-actions">
          <button className="icon-button ghost" type="button" aria-label="Add">
            +
          </button>
          <button
            className="icon-button ghost"
            type="button"
            aria-label="Expand"
          >
            {">"}
          </button>
        </div>
      </div>
      <div className="chip-row">
        <button className="chip is-active" type="button">
          Playlists
        </button>
        <button className="chip" type="button">
          Podcasts
        </button>
      </div>
      <div className="library-tools">
        <button
          className="icon-button ghost"
          type="button"
          aria-label="Search library"
        >
          S
        </button>
        <button className="text-button" type="button">
          Recents
        </button>
        <button
          className="icon-button ghost"
          type="button"
          aria-label="Sort"
        >
          ==
        </button>
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
