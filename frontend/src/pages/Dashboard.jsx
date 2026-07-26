import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout.jsx";

const COLORS = ["#1f6f5c", "#d98e3f", "#3c5a99", "#b3432f", "#6b7685"];

export default function Dashboard() {
  const { user } = useAuth();
  const [mine, setMine] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const meRes = await client.get("/api/dashboard/me");
        setMine(meRes.data);
      } catch (e) {
        // ignore
      }
      try {
        const adminRes = await client.get("/api/dashboard/admin");
        setAdmin(adminRes.data);
      } catch (e) {
        // reviewers may still access admin stats; ignore failures
      }
      setLoading(false);
    };
    load();
  }, []);

  const statusData = admin
    ? Object.entries(admin.publications_by_status).map(([name, value]) => ({ name, value }))
    : [];
  const typeData = admin
    ? Object.entries(admin.publications_by_type).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="eyebrow">Overview</div>
          <h1>Welcome, {user?.name?.split(" ")[0]}</h1>
          <p className="lead">
            Your personal research activity alongside network-wide collaboration statistics.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading-row">Loading dashboard…</div>
      ) : (
        <>
          <h3 style={{ marginBottom: 12 }}>Your activity</h3>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{mine?.publications ?? 0}</div>
              <div className="stat-label">Publications</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{mine?.projects ?? 0}</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{mine?.conferences ?? 0}</div>
              <div className="stat-label">Conferences</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{mine?.collaborators ?? 0}</div>
              <div className="stat-label">Collaborations</div>
            </div>
          </div>

          {admin && (
            <>
              <h3 style={{ marginBottom: 12 }}>Network-wide</h3>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-value">{admin.totals.researchers}</div>
                  <div className="stat-label">Researchers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{admin.totals.publications}</div>
                  <div className="stat-label">Publications</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{admin.totals.projects}</div>
                  <div className="stat-label">Projects</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{admin.totals.collaborations}</div>
                  <div className="stat-label">Collaboration links</div>
                </div>
              </div>

              <div className="two-col">
                <div className="chart-card">
                  <h3>Publications by status</h3>
                  {statusData.length === 0 ? (
                    <p style={{ color: "var(--slate)" }}>No publications recorded yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7e0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#1f6f5c" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="chart-card">
                  <h3>Publications by type</h3>
                  {typeData.length === 0 ? (
                    <p style={{ color: "var(--slate)" }}>No publications recorded yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={typeData} dataKey="value" nameKey="name" outerRadius={90} label>
                          {typeData.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
}
