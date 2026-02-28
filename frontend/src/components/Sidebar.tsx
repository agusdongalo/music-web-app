import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuthStore } from "../store/authStore";
import CreatePlaylistModal from "./CreatePlaylistModal";

const libraryItems = [
  {
    title: "Liked Songs",
    meta: "Playlist - 244 songs",
    tone: "liked",
    label: "LS",
    type: "playlist",
  },
  {
    title: "Your Episodes",
    meta: "Podcast - Updated today",
    tone: "podcast",
    label: "YE",
    type: "podcast",
  },
  {
    title: "Yearner Final Boss",
    meta: "Playlist - catchthy",
    tone: "chill",
    label: "YF",
    type: "playlist",
  },
  {
    title: "Thirst Trap Pero English?",
    meta: "Playlist - yesh",
    tone: "liked",
    label: "TT",
    type: "playlist",
  },
  {
    title: "Gym Phonk 2026",
    meta: "Playlist - magicmusicsquad",
    tone: "chill",
    label: "GP",
    type: "playlist",
  },
];

type Playlist = {
  id: string;
  name: string;
};

export default function Sidebar() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [filter, setFilter] = useState<"playlists" | "podcasts">("playlists");
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<"recent" | "az" | "za">("recent");
  const [compact, setCompact] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!token) {
      setMyPlaylists([]);
      return;
    }

    let active = true;
    apiFetch<Playlist[]>("/playlists")
      .then((data) => {
        if (!active) {
          return;
        }
        setMyPlaylists(data);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setMyPlaylists([]);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredLibraryItems = useMemo(() => {
    const items = libraryItems.filter((item) => item.type === filter);
    const searched = normalizedQuery
      ? items.filter(
          (item) =>
            item.title.toLowerCase().includes(normalizedQuery) ||
            item.meta.toLowerCase().includes(normalizedQuery)
        )
      : items;

    if (sortMode === "az") {
      return [...searched].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortMode === "za") {
      return [...searched].sort((a, b) => b.title.localeCompare(a.title));
    }
    return searched;
  }, [filter, normalizedQuery, sortMode]);

  const filteredMyPlaylists = useMemo(() => {
    const items = normalizedQuery
      ? myPlaylists.filter((playlist) =>
          playlist.name.toLowerCase().includes(normalizedQuery)
        )
      : myPlaylists;
    if (sortMode === "az") {
      return [...items].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortMode === "za") {
      return [...items].sort((a, b) => b.name.localeCompare(a.name));
    }
    return items;
  }, [myPlaylists, normalizedQuery, sortMode]);

  const sortLabel =
    sortMode === "recent" ? "Recents" : sortMode === "az" ? "A-Z" : "Z-A";

  return (
    <aside className="sidebar">
      <div className="library-header">
        <h2 className="library-title">Your Library</h2>
        <div className="library-actions">
          <button
            className="icon-button ghost"
            type="button"
            aria-label="Add"
            onClick={() => {
              if (!token) {
                navigate("/login");
                return;
              }
              setShowCreate(true);
            }}
          >
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
          <button
            className="icon-button ghost"
            type="button"
            aria-label="Expand"
            onClick={() => setCompact((prev) => !prev)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 6h6m0 0v6m0-6-8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="chip-row">
        <button
          className={`chip ${filter === "playlists" ? "is-active" : ""}`}
          type="button"
          onClick={() => setFilter("playlists")}
        >
          Playlists
        </button>
        <button
          className={`chip ${filter === "podcasts" ? "is-active" : ""}`}
          type="button"
          onClick={() => setFilter("podcasts")}
        >
          Podcasts
        </button>
      </div>
      <div className="library-tools">
        <button
          className="icon-button ghost"
          type="button"
          aria-label="Search library"
          aria-pressed={showSearch}
          onClick={() => setShowSearch((prev) => !prev)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm7.5 9.5L21 19"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() =>
            setSortMode((prev) => (prev === "recent" ? "az" : "recent"))
          }
        >
          {sortLabel}
        </button>
        <button
          className="icon-button ghost"
          type="button"
          aria-label="Sort"
          onClick={() =>
            setSortMode((prev) => (prev === "az" ? "za" : "az"))
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 6h10M7 12h10M7 18h10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {showSearch && (
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search in your library"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      )}
      <div className="sidebar-list">
        {filteredLibraryItems.length === 0 ? (
          <p className="sidebar-empty">No matches found.</p>
        ) : (
          filteredLibraryItems.map((item) => (
            <button
              className={`sidebar-item ${compact ? "compact" : ""}`.trim()}
              type="button"
              key={item.title}
            >
            <div className={`item-cover ${item.tone}`}>{item.label}</div>
            <div>
              <div className="item-title">{item.title}</div>
              <div className="item-meta">{item.meta}</div>
            </div>
            </button>
          ))
        )}
      </div>
      {token && filter === "playlists" && (
        <div className="sidebar-section">
          <div className="sidebar-section-head">
            <span className="sidebar-label">My playlists</span>
          </div>
          {filteredMyPlaylists.length === 0 ? (
            <p className="sidebar-empty">No playlists yet.</p>
          ) : (
            <div className="sidebar-list">
              {filteredMyPlaylists.map((playlist) => (
                <Link
                  key={playlist.id}
                  className={`sidebar-item ${compact ? "compact" : ""}`.trim()}
                  to={`/playlist/${playlist.id}`}
                >
                  <div className="item-cover">PL</div>
                  <div>
                    <div className="item-title">{playlist.name}</div>
                    <div className="item-meta">Playlist</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      <CreatePlaylistModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(playlist) =>
          setMyPlaylists((prev) => [playlist, ...prev])
        }
      />
    </aside>
  );
}
