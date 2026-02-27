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

export default function LoginPage() {
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
      const data = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuth(data.token, data.user);
      setStatus("idle");
      navigate(from, { replace: true });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <section className="page-section">
      <div className="auth-shell">
        <div>
          <h2>Login</h2>
          <p className="section-subtitle">
            Connect to your account to keep your library in sync.
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-actions">
            <button
              className="button-primary"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Signing in..." : "Sign in"}
            </button>
            <span className="auth-helper">Demo: demo@music.app</span>
          </div>
        </form>
        <div className="auth-footer">
          <span>New here?</span>
          <Link className="text-button" to="/register">
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}
