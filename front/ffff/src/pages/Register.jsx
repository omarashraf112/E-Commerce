import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { SparklesIcon, ArrowRightIcon } from "@/components/icons/Icons";
import "./auth.css";

export function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(name, email, password);
      toast.success("Account created — welcome to Souqly!");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create account. Try another email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <SparklesIcon size={24} />
          </div>
          <span className="eyebrow">New Member</span>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">Join thousands of shoppers enjoying curated goods and express shipping.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error-banner">
              <span>{error}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Layla Hassan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password (min. 6 characters)</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg auth-submit-btn"
            disabled={busy}
          >
            {busy ? "Creating Account…" : "Create Account"}
            {!busy && <ArrowRightIcon size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          Already shopping with us? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
