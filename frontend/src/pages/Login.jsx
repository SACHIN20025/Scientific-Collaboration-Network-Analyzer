import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import NetworkMotif from "../components/NetworkMotif.jsx";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/");
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <NetworkMotif
          className="motif"
          style={{ position: "absolute", top: "10%", right: "-40px", width: "420px", opacity: 0.9 }}
        />
        <h1>Map the network behind every discovery.</h1>
        <p>
          Track co-authorship, funding projects, conference participation, and citations across
          institutions — all from one collaboration ledger.
        </p>
      </div>
      <div className="auth-form-side">
        <div className="auth-box">
          <div className="eyebrow">Sign in</div>
          <h2>Welcome back</h2>
          <p style={{ color: "var(--slate)", marginBottom: 24 }}>
            Access your research dashboard and collaboration records.
          </p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.edu"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <div className="auth-switch">
            No account yet? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
