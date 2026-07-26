import { useEffect, useState } from "react";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";

const emptyForm = {
  name: "",
  description: "",
  location: "",
  start_date: "",
  end_date: "",
  website: "",
};

export default function Conferences() {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async (q = "") => {
    setLoading(true);
    const res = await client.get("/api/conferences", { params: q ? { search: q } : {} });
    setConferences(res.data);
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

  const openEdit = (c) => {
    setForm({
      name: c.name || "",
      description: c.description || "",
      location: c.location || "",
      start_date: c.start_date || "",
      end_date: c.end_date || "",
      website: c.website || "",
    });
    setEditingId(c.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this conference?")) return;
    await client.delete(`/api/conferences/${id}`);
    load(search);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await client.put(`/api/conferences/${editingId}`, form);
    } else {
      await client.post("/api/conferences", form);
    }
    setSaving(false);
    setShowModal(false);
    load(search);
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="eyebrow">Events</div>
          <h1>Conferences</h1>
          <p className="lead">Registration, presentation records, participation, and scheduling.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + New conference
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search conferences…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
        />
        <button className="btn btn-secondary" onClick={() => load(search)}>
          Search
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="loading-row">Loading conferences…</div>
        ) : conferences.length === 0 ? (
          <div className="empty-state">
            <h3>No conferences yet</h3>
            <p>Register a conference to track participation.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Dates</th>
                <th>Participants</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {conferences.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    {c.website && (
                      <div style={{ fontSize: "0.78rem" }}>
                        <a href={c.website} target="_blank" rel="noreferrer">
                          {c.website}
                        </a>
                      </div>
                    )}
                  </td>
                  <td>{c.location || "—"}</td>
                  <td>
                    {c.start_date || "—"} → {c.end_date || "—"}
                  </td>
                  <td>{(c.participants || []).length}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>
                      Edit
                    </button>{" "}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
                      Delete
                    </button>
                  </td>
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
              <h3>{editingId ? "Edit conference" : "New conference"}</h3>
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
              <div className="form-grid">
                <div className="field">
                  <label>Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Website</label>
                  <input
                    type="text"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
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
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create conference"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
