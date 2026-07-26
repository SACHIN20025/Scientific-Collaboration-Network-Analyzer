import { useEffect, useState } from "react";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const TYPES = [
  "journal_paper",
  "conference_paper",
  "book",
  "patent",
  "technical_report",
  "other",
];
const STATUSES = ["draft", "submitted", "published", "archived"];

const emptyForm = {
  title: "",
  abstract: "",
  type: "journal_paper",
  status: "draft",
  co_author_names: "",
  journal_or_venue: "",
  publication_date: "",
  doi: "",
  keywords: "",
};

export default function Publications() {
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    const res = await client.get("/api/publications", { params });
    setPubs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (pub) => {
    setForm({
      title: pub.title || "",
      abstract: pub.abstract || "",
      type: pub.type || "journal_paper",
      status: pub.status || "draft",
      co_author_names: (pub.co_author_names || []).join(", "),
      journal_or_venue: pub.journal_or_venue || "",
      publication_date: pub.publication_date || "",
      doi: pub.doi || "",
      keywords: (pub.keywords || []).join(", "),
    });
    setEditingId(pub.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this publication?")) return;
    await client.delete(`/api/publications/${id}`);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      co_author_names: form.co_author_names
        ? form.co_author_names.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      keywords: form.keywords ? form.keywords.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    if (editingId) {
      await client.put(`/api/publications/${editingId}`, payload);
    } else {
      await client.post("/api/publications", payload);
    }
    setSaving(false);
    setShowModal(false);
    load();
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="eyebrow">Repository</div>
          <h1>Publications</h1>
          <p className="lead">
            Journal papers, conference papers, books, patents, and technical reports with a draft
            → submitted → published → archived workflow.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + New publication
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search title, venue, or keyword…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={load}>
          Search
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="loading-row">Loading publications…</div>
        ) : pubs.length === 0 ? (
          <div className="empty-state">
            <h3>No publications yet</h3>
            <p>Create your first publication to start building the repository.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Venue</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pubs.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.title}</strong>
                    {p.doi && <div className="mono" style={{ color: "var(--slate)" }}>{p.doi}</div>}
                  </td>
                  <td>{p.type?.replace("_", " ")}</td>
                  <td>{p.journal_or_venue || "—"}</td>
                  <td>
                    <StatusBadge value={p.status} />
                  </td>
                  <td>{p.publication_date || "—"}</td>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Edit publication" : "New publication"}</h3>
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
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Journal / Venue</label>
                  <input
                    type="text"
                    value={form.journal_or_venue}
                    onChange={(e) => setForm({ ...form, journal_or_venue: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Publication date</label>
                  <input
                    type="date"
                    value={form.publication_date}
                    onChange={(e) => setForm({ ...form, publication_date: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>DOI</label>
                  <input type="text" value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} />
                </div>
                <div className="field">
                  <label>Keywords</label>
                  <input
                    type="text"
                    placeholder="comma-separated"
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label>Co-author names</label>
                  <input
                    type="text"
                    placeholder="comma-separated"
                    value={form.co_author_names}
                    onChange={(e) => setForm({ ...form, co_author_names: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label>Abstract</label>
                  <textarea value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create publication"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
