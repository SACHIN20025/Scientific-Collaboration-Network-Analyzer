import { useEffect, useState } from "react";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Researchers() {
  const { user } = useAuth();
  const [researchers, setResearchers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    department: "",
    institution: "",
    skills: "",
    research_interests: "",
    affiliations: "",
    bio: "",
    orcid: "",
  });
  const [saving, setSaving] = useState(false);

  const loadResearchers = async (query = "") => {
    setLoading(true);
    const res = await client.get("/api/researchers", { params: query ? { search: query } : {} });
    setResearchers(res.data);
    setLoading(false);
  };

  const loadMyProfile = async () => {
    try {
      const res = await client.get("/api/researchers/me");
      setProfile(res.data);
      setForm({
        department: res.data.department || "",
        institution: res.data.institution || "",
        skills: (res.data.skills || []).join(", "),
        research_interests: (res.data.research_interests || []).join(", "),
        affiliations: (res.data.affiliations || []).join(", "),
        bio: res.data.bio || "",
        orcid: res.data.orcid || "",
      });
    } catch (e) {
      // no profile yet
    }
  };

  useEffect(() => {
    loadResearchers();
    loadMyProfile();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadResearchers(search);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      department: form.department || null,
      institution: form.institution || null,
      skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      research_interests: form.research_interests
        ? form.research_interests.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      affiliations: form.affiliations
        ? form.affiliations.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      bio: form.bio || null,
      orcid: form.orcid || null,
    };
    const res = await client.put("/api/researchers/me", payload);
    setProfile(res.data);
    setSaving(false);
    setEditing(false);
    loadResearchers(search);
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="eyebrow">Directory</div>
          <h1>Researchers</h1>
          <p className="lead">
            Academic profiles, departments, skills, and research interests across the network.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
          {editing ? "Close" : "Edit my profile"}
        </button>
      </div>

      {editing && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>My researcher profile</h3>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="field">
                <label>Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Institution</label>
                <input
                  type="text"
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                />
              </div>
              <div className="field full">
                <label>Skills</label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="comma-separated, e.g. Machine Learning, NLP"
                />
              </div>
              <div className="field full">
                <label>Research interests</label>
                <input
                  type="text"
                  value={form.research_interests}
                  onChange={(e) => setForm({ ...form, research_interests: e.target.value })}
                  placeholder="comma-separated"
                />
              </div>
              <div className="field full">
                <label>Affiliations</label>
                <input
                  type="text"
                  value={form.affiliations}
                  onChange={(e) => setForm({ ...form, affiliations: e.target.value })}
                  placeholder="comma-separated"
                />
              </div>
              <div className="field">
                <label>ORCID</label>
                <input
                  type="text"
                  value={form.orcid}
                  onChange={(e) => setForm({ ...form, orcid: e.target.value })}
                  placeholder="0000-0000-0000-0000"
                />
              </div>
              <div className="field full">
                <label>Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </button>
          </form>
        </div>
      )}

      <form className="toolbar" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, skill, or research interest…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-secondary" type="submit">
          Search
        </button>
      </form>

      <div className="table-wrap">
        {loading ? (
          <div className="loading-row">Loading researchers…</div>
        ) : researchers.length === 0 ? (
          <div className="empty-state">
            <h3>No researchers found</h3>
            <p>Try a different search term.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Institution</th>
                <th>Skills</th>
                <th>Research interests</th>
              </tr>
            </thead>
            <tbody>
              {researchers.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <div style={{ color: "var(--slate)", fontSize: "0.78rem" }}>{r.email}</div>
                  </td>
                  <td>{r.department || "—"}</td>
                  <td>{r.institution || "—"}</td>
                  <td>
                    <div className="tag-list">
                      {(r.skills || []).slice(0, 4).map((s) => (
                        <span className="tag-chip" key={s}>
                          {s}
                        </span>
                      ))}
                      {(r.skills || []).length === 0 && "—"}
                    </div>
                  </td>
                  <td>
                    <div className="tag-list">
                      {(r.research_interests || []).slice(0, 4).map((s) => (
                        <span className="tag-chip" key={s}>
                          {s}
                        </span>
                      ))}
                      {(r.research_interests || []).length === 0 && "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
