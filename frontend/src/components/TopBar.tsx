import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function TopBar() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
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
          <button className="home-button" type="button" aria-label="Home" title="Home">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5z"
                fill="currentColor"
              />
            </svg>
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
