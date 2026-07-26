import { useEffect, useState } from "react";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";

export default function Citations() {
  const [citations, setCitations] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    citing_publication_id: "",
    cited_publication_id: "",
    cited_reference_text: "",
    doi: "",
  });

  const load = async () => {
    setLoading(true);
    const [cRes, pRes] = await Promise.all([
      client.get("/api/citations"),
      client.get("/api/publications"),
    ]);
    setCitations(cRes.data);
    setPublications(pRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const pubTitle = (id) => publications.find((p) => p.id === id)?.title || id;

  const handleDelete = async (id) => {
    if (!confirm("Delete this citation record?")) return;
    await client.delete(`/api/citations/${id}`);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      citing_publication_id: form.citing_publication_id,
      cited_publication_id: form.cited_publication_id || null,
      cited_reference_text: form.cited_reference_text || null,
      doi: form.doi || null,
    };
    await client.post("/api/citations", payload);
    setSaving(false);
    setShowModal(false);
    setForm({ citing_publication_id: "", cited_publication_id: "", cited_reference_text: "", doi: "" });
    load();
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="eyebrow">References</div>
          <h1>Citations & References</h1>
          <p className="lead">
            Track citation records, reference lists, DOI linking, and publication cross-references.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New citation
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="loading-row">Loading citations…</div>
        ) : citations.length === 0 ? (
          <div className="empty-state">
            <h3>No citation records yet</h3>
            <p>Link a publication to a reference to build the citation graph.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Citing publication</th>
                <th>Cited publication / reference</th>
                <th>DOI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {citations.map((c) => (
                <tr key={c.id}>
                  <td>{pubTitle(c.citing_publication_id)}</td>
                  <td>
                    {c.cited_publication_id ? pubTitle(c.cited_publication_id) : c.cited_reference_text || "—"}
                  </td>
                  <td className="mono">{c.doi || "—"}</td>
                  <td>
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
              <h3>New citation</h3>
              <button className="close-x" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field full">
                <label>Citing publication</label>
                <select
                  required
                  value={form.citing_publication_id}
                  onChange={(e) => setForm({ ...form, citing_publication_id: e.target.value })}
                >
                  <option value="">Select publication…</option>
                  {publications.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field full">
                <label>Cited publication (if in system)</label>
                <select
                  value={form.cited_publication_id}
                  onChange={(e) => setForm({ ...form, cited_publication_id: e.target.value })}
                >
                  <option value="">None</option>
                  {publications.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field full">
                <label>Or external reference text</label>
                <textarea
                  placeholder="Full citation text for a reference outside the system"
                  value={form.cited_reference_text}
                  onChange={(e) => setForm({ ...form, cited_reference_text: e.target.value })}
                />
              </div>
              <div className="field full">
                <label>DOI</label>
                <input type="text" value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Create citation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
