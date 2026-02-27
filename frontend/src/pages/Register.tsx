import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuthStore } from "../store/authStore";

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
  };
};

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const data = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
      });
      setAuth(data.token, data.user);
      setStatus("idle");
      navigate(from, { replace: true });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <section className="page-section">
      <div className="auth-shell">
        <div>
          <h2>Create Account</h2>
          <p className="section-subtitle">
            Register to build playlists and save your favorites.
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Display name</span>
            <input
              type="text"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Midnight Listener"
            />
          </label>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@midnight.fm"
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-actions">
            <button
              className="button-primary"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>
        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link className="text-button" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
