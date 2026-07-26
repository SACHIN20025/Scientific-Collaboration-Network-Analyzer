import { useEffect, useState } from "react";
import client from "../api/client.js";
import Layout from "../components/Layout.jsx";

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    const s = val === null || val === undefined ? "" : String(val);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(",")];
  rows.forEach((r) => {
    lines.push(headers.map((h) => escape(Array.isArray(r[h]) ? r[h].join("; ") : r[h])).join(","));
  });
  return lines.join("\n");
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const REPORTS = [
  { key: "publications", label: "Publication report", endpoint: "/api/publications" },
  { key: "projects", label: "Research / project report", endpoint: "/api/projects" },
  { key: "collaborations", label: "Collaboration report", endpoint: "/api/collaborations" },
  { key: "researchers", label: "Institution / researcher report", endpoint: "/api/researchers" },
];

export default function Reports() {
  const [admin, setAdmin] = useState(null);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    client.get("/api/dashboard/admin").then((res) => setAdmin(res.data));
  }, []);

  const handleExport = async (report, format) => {
    setExporting(report.key + format);
    const res = await client.get(report.endpoint);
    const rows = res.data.map((r) => {
      const { ...rest } = r;
      return rest;
    });
    if (format === "csv") {
      downloadFile(`${report.key}_report.csv`, toCsv(rows), "text/csv");
    } else {
      downloadFile(`${report.key}_report.json`, JSON.stringify(rows, null, 2), "application/json");
    }
    setExporting(null);
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="eyebrow">Analytics</div>
          <h1>Reports & Export</h1>
          <p className="lead">
            Publication, research, collaboration, and institution reports. Export to CSV for Excel,
            or JSON for downstream tooling.
          </p>
        </div>
      </div>

      {admin && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{admin.totals.publications}</div>
            <div className="stat-label">Total publications</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{admin.totals.projects}</div>
            <div className="stat-label">Total projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{admin.totals.collaborations}</div>
            <div className="stat-label">Collaboration links</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{admin.totals.citations}</div>
            <div className="stat-label">Citation records</div>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Report</th>
              <th>Export</th>
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r) => (
              <tr key={r.key}>
                <td>{r.label}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={exporting === r.key + "csv"}
                    onClick={() => handleExport(r, "csv")}
                  >
                    {exporting === r.key + "csv" ? "Exporting…" : "Export CSV"}
                  </button>{" "}
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={exporting === r.key + "json"}
                    onClick={() => handleExport(r, "json")}
                  >
                    {exporting === r.key + "json" ? "Exporting…" : "Export JSON"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
