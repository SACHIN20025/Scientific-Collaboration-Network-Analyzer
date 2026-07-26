import { useEffect, useState } from "react";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    client
      .get("/api/audit")
      .then((res) => setLogs(res.data))
      .catch((err) => setErrorMsg(err.response?.data?.detail || "Unable to load audit logs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="eyebrow">Compliance</div>
          <h1>Audit Log</h1>
          <p className="lead">User activity, logins, and system events. Visible to admins only.</p>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="loading-row">Loading audit log…</div>
        ) : errorMsg ? (
          <div className="empty-state">
            <h3>Access restricted</h3>
            <p>{errorMsg}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <h3>No activity recorded yet</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="mono">{new Date(l.timestamp).toLocaleString()}</td>
                  <td>{l.action}</td>
                  <td>{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
