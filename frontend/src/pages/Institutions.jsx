import { useEffect, useState } from "react";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";

export default function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", website: "", departments: "" });
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await client.get("/api/institutions");
    setInstitutions(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this institution?")) return;
    await client.delete(`/api/institutions/${id}`);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      address: form.address || null,
      website: form.website || null,
      departments: form.departments
        ? form.departments.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    await client.post("/api/institutions", payload);
    setSaving(false);
    setShowModal(false);
    setForm({ name: "", address: "", website: "", departments: "" });
    load();
  };

  const viewStats = async (name) => {
    setSelected(name);
    const res = await client.get(`/api/dashboard/institution/${encodeURIComponent(name)}`);
    setStats(res.data);
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="eyebrow">Organizations</div>
          <h1>Institutions</h1>
          <p className="lead">Universities, research institutes, and partner organizations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New institution
        </button>
      </div>

      <div className="two-col">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-row">Loading institutions…</div>
          ) : institutions.length === 0 ? (
            <div className="empty-state">
              <h3>No institutions yet</h3>
              <p>Register a university or research institute to get started.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Departments</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <strong>{i.name}</strong>
                      {i.website && (
                        <div style={{ fontSize: "0.78rem" }}>
                          <a href={i.website} target="_blank" rel="noreferrer">
                            {i.website}
                          </a>
                        </div>
                      )}
                    </td>
                    <td>{(i.departments || []).join(", ") || "—"}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => viewStats(i.name)}>
                        Stats
                      </button>{" "}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="chart-card">
          <h3>{selected ? `${selected} — snapshot` : "Institution snapshot"}</h3>
          {!stats ? (
            <p style={{ color: "var(--slate)" }}>Select "Stats" on an institution to see its profile.</p>
          ) : (
            <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="stat-card">
                <div className="stat-value">{stats.researchers}</div>
                <div className="stat-label">Researchers</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.publications}</div>
                <div className="stat-label">Publications</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.projects}</div>
                <div className="stat-label">Projects</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.departments.length}</div>
                <div className="stat-label">Departments</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New institution</h3>
              <button className="close-x" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field full">
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="field full">
                <label>Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="field full">
                <label>Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
              <div className="field full">
                <label>Departments</label>
                <input
                  type="text"
                  placeholder="comma-separated"
                  value={form.departments}
                  onChange={(e) => setForm({ ...form, departments: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Create institution"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
