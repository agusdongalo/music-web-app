import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuthStore } from "../store/authStore";

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

type Playlist = {
  id: string;
  name: string;
};

export default function Sidebar() {
  const token = useAuthStore((state) => state.token);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);

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

  return (
    <aside className="sidebar">
      <div className="library-header">
        <h2 className="library-title">Your Library</h2>
        <div className="library-actions">
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
          <button
            className="icon-button ghost"
            type="button"
            aria-label="Expand"
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
        <button className="text-button" type="button">
          Recents
        </button>
        <button
          className="icon-button ghost"
          type="button"
          aria-label="Sort"
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
      {token && (
        <div className="sidebar-section">
          <div className="sidebar-section-head">
            <span className="sidebar-label">My playlists</span>
          </div>
          {myPlaylists.length === 0 ? (
            <p className="sidebar-empty">No playlists yet.</p>
          ) : (
            <div className="sidebar-list">
              {myPlaylists.map((playlist) => (
                <a
                  key={playlist.id}
                  className="sidebar-item compact"
                  href={`/playlist/${playlist.id}`}
                >
                  <div className="item-cover">PL</div>
                  <div>
                    <div className="item-title">{playlist.name}</div>
                    <div className="item-meta">Playlist</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
