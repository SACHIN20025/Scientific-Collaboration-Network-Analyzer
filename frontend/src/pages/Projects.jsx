import { useEffect, useState } from "react";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const STATUSES = ["planned", "ongoing", "completed", "on_hold"];

const emptyForm = {
  title: "",
  description: "",
  funding_source: "",
  budget: "",
  start_date: "",
  end_date: "",
  status: "planned",
  team_members: "",
  institutions: "",
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Co-authorship link creator
  const [linkA, setLinkA] = useState("");
  const [linkB, setLinkB] = useState("");
  const [collabs, setCollabs] = useState([]);

  const load = async () => {
    setLoading(true);
    const [pRes, rRes, cRes] = await Promise.all([
      client.get("/api/projects"),
      client.get("/api/researchers"),
      client.get("/api/collaborations"),
    ]);
    setProjects(pRes.data);
    setResearchers(rRes.data);
    setCollabs(cRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      title: p.title || "",
      description: p.description || "",
      funding_source: p.funding_source || "",
      budget: p.budget ?? "",
      start_date: p.start_date || "",
      end_date: p.end_date || "",
      status: p.status || "planned",
      team_members: (p.team_members || []).join(", "),
      institutions: (p.institutions || []).join(", "),
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    await client.delete(`/api/projects/${id}`);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      budget: form.budget ? Number(form.budget) : null,
      team_members: form.team_members
        ? form.team_members.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      institutions: form.institutions
        ? form.institutions.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    if (editingId) {
      await client.put(`/api/projects/${editingId}`, payload);
    } else {
      await client.post("/api/projects", payload);
    }
    setSaving(false);
    setShowModal(false);
    load();
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    if (!linkA || !linkB || linkA === linkB) return;
    await client.post("/api/collaborations", {
      researcher_a: linkA,
      researcher_b: linkB,
      collaboration_type: "co-authorship",
    });
    setLinkA("");
    setLinkB("");
    load();
  };

  const researcherName = (id) => researchers.find((r) => r.id === id)?.name || id;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="eyebrow">Collaboration</div>
          <h1>Projects & Collaboration</h1>
          <p className="lead">
            Funding projects, team assignments, institutional partnerships, and co-authorship
            links.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + New project
        </button>
      </div>

      <div className="table-wrap" style={{ marginBottom: 28 }}>
        {loading ? (
          <div className="loading-row">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>Create a funding project to start tracking collaborations.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Funding source</th>
                <th>Status</th>
                <th>Team size</th>
                <th>Timeline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.title}</strong>
                  </td>
                  <td>{p.funding_source || "—"}</td>
                  <td>
                    <StatusBadge value={p.status} />
                  </td>
                  <td>{(p.team_members || []).length}</td>
                  <td>
                    {p.start_date || "—"} → {p.end_date || "—"}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                      Edit
                    </button>{" "}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h3>Co-author network links</h3>
      <div className="card" style={{ marginBottom: 20 }}>
        <form className="toolbar" onSubmit={handleCreateLink} style={{ marginBottom: 0 }}>
          <select value={linkA} onChange={(e) => setLinkA(e.target.value)} style={{ flex: 1 }}>
            <option value="">Researcher A</option>
            {researchers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <span style={{ color: "var(--slate)" }}>⇄</span>
          <select value={linkB} onChange={(e) => setLinkB(e.target.value)} style={{ flex: 1 }}>
            <option value="">Researcher B</option>
            {researchers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            Link collaborators
          </button>
        </form>
      </div>

      <div className="table-wrap">
        {collabs.length === 0 ? (
          <div className="empty-state">
            <h3>No collaboration links yet</h3>
            <p>Use the form above to record a co-authorship connection.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Researcher A</th>
                <th>Researcher B</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {collabs.map((c) => (
                <tr key={c.id}>
                  <td>{researcherName(c.researcher_a)}</td>
                  <td>{researcherName(c.researcher_b)}</td>
                  <td>{c.collaboration_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Edit project" : "New project"}</h3>
              <button className="close-x" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field full">
                <label>Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Funding source</label>
                  <input
                    type="text"
                    value={form.funding_source}
                    onChange={(e) => setForm({ ...form, funding_source: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Budget (USD)</label>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Start date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>End date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label>Team members</label>
                  <input
                    type="text"
                    placeholder="comma-separated researcher IDs or names"
                    value={form.team_members}
                    onChange={(e) => setForm({ ...form, team_members: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label>Partner institutions</label>
                  <input
                    type="text"
                    placeholder="comma-separated"
                    value={form.institutions}
                    onChange={(e) => setForm({ ...form, institutions: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
