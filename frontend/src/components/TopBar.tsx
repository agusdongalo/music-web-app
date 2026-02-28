import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function TopBar() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [historyIndex, setHistoryIndex] = useState(() => window.history.state?.idx ?? 0);
  const [maxHistoryIndex, setMaxHistoryIndex] = useState(
    () => window.history.state?.idx ?? 0
  );
  const isSearchPage = location.pathname.startsWith("/search");

  useEffect(() => {
    if (!isSearchPage) return;
    const q = searchParams.get("q") ?? "";
    setSearchText(q);
  }, [isSearchPage, searchParams]);

  useEffect(() => {
    const idx = window.history.state?.idx ?? 0;
    setHistoryIndex(idx);
    setMaxHistoryIndex((prev) => (idx > prev ? idx : prev));
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchText.trim();
    if (!trimmed) {
      navigate("/search", { replace: true });
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSearchFocus = () => {
    if (!isSearchPage) {
      navigate("/search");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    const trimmed = value.trim();
    if (!trimmed) {
      navigate("/search", { replace: true });
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: true });
    }
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < maxHistoryIndex;

  const handleBack = () => {
    if (!canGoBack) return;
    navigate(-1);
  };

  const handleForward = () => {
    if (!canGoForward) return;
    navigate(1);
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-nav">
          <button
            className="icon-button ghost"
            type="button"
            aria-label="Go back"
            title="Back"
            onClick={handleBack}
            disabled={!canGoBack}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M14.5 6 8.5 12l6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="icon-button ghost"
            type="button"
            aria-label="Go forward"
            title="Forward"
            onClick={handleForward}
            disabled={!canGoForward}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9.5 6 15.5 12l-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="home-button"
            type="button"
            aria-label="Home"
            title="Home"
            onClick={handleHome}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <form className="search-field" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="What do you want to play?"
            value={searchText}
            onChange={(event) => handleSearchChange(event.target.value)}
            onFocus={handleSearchFocus}
          />
        </form>
      </div>
      <div className="topbar-actions">
        <button className="button-primary topbar-cta" type="button">
          Explore Premium
        </button>
        {token ? (
          <>
            <div className="avatar">{user?.displayName?.[0] ?? "U"}</div>
            <button className="button-secondary" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="text-button" to="/login">
              Login
            </Link>
            <Link className="button-secondary" to="/register">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
