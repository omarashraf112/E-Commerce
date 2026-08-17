import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { LockIcon, UserIcon, ArrowRightIcon } from "@/components/icons/Icons";
import "./auth.css";

export function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName?.split(" ")[0] || "Shopper"}!`);
      const from = location.state?.from?.pathname;
      navigate(user.isAdmin || user.isSeller ? "/dashboard" : from || "/", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setBusy(false);
    }
  }

  function handleFillDemo() {
    setEmail("admin@souqly.com");
    setPassword("Admin123!");
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <UserIcon size={24} />
          </div>
          <span className="eyebrow">Welcome Back</span>
          <h1 className="auth-title">Sign in to Souqly</h1>
          <p className="auth-sub">Access your orders, saved wishlist items, and member perks.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error-banner">
              <span>{error}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <div className="field-label-row">
              <label htmlFor="password">Password</label>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg auth-submit-btn"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign In"}
            {!busy && <ArrowRightIcon size={18} />}
          </button>
        </form>

        <div className="demo-credentials-box">
          <span>Testing locally?</span>
          <button type="button" className="demo-fill-btn" onClick={handleFillDemo}>
            Fill Demo Credentials
          </button>
        </div>

        <p className="auth-switch">
          New to Souqly? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
