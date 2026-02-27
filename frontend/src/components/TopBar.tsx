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
