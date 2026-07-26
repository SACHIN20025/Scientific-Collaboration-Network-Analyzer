import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import NetworkMotif from "../components/NetworkMotif.jsx";

const ROLES = [
  { value: "researcher", label: "Researcher" },
  { value: "institution_admin", label: "Institution Admin" },
  { value: "reviewer", label: "Reviewer" },
  { value: "system_admin", label: "System Admin" },
];

export default function Register() {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "researcher",
    institution_name: "",
    department: "",
  });

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await register(form);
    if (ok) navigate("/");
  };

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <NetworkMotif
          style={{ position: "absolute", top: "8%", right: "-40px", width: "420px", opacity: 0.9 }}
        />
        <h1>Every collaborator, every paper, one graph.</h1>
        <p>
          Join a shared research ledger where institutions, projects, and publications connect
          automatically as your team works.
        </p>
      </div>
      <div className="auth-form-side">
        <div className="auth-box">
          <div className="eyebrow">Create account</div>
          <h2>Register</h2>
          <p style={{ color: "var(--slate)", marginBottom: 24 }}>
            Set up your researcher profile in under a minute.
          </p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" type="text" required value={form.name} onChange={update("name")} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={form.email} onChange={update("email")} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update("password")}
              />
            </div>
            <div className="field">
              <label htmlFor="role">Role</label>
              <select id="role" value={form.role} onChange={update("role")}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="institution_name">Institution</label>
              <input
                id="institution_name"
                type="text"
                value={form.institution_name}
                onChange={update("institution_name")}
                placeholder="e.g. University of Lucknow"
              />
            </div>
            <div className="field">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                type="text"
                value={form.department}
                onChange={update("department")}
                placeholder="e.g. Computer Science"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <div className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
