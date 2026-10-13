import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/apiClient";
import { Users, CheckCircle, AlertOctagon, TrendingUp, Mail, Trash2, ExternalLink, Shield } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  const fetchStats = () => {
    adminApi
      .getStats()
      .then((res) => setData(res.data))
      .catch((err) => console.error("Admin stats fetch error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleMail = async (id) => {
    setActionMessage("");
    try {
      const res = await adminApi.mailCandidate(id);
      setActionMessage("Report dispatched to candidate email successfully.");
    } catch (err) {
      alert("Failed to email candidate: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview record?")) return;
    try {
      await adminApi.deleteResult(id);
      setActionMessage("Record removed.");
      fetchStats();
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p>Loading admin analytics console...</p>
      </div>
    );
  }

  const { stats, roundCounts, results } = data || {};

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <span className="badge badge-warning" style={{ marginBottom: "0.4rem" }}>
            <Shield size={13} /> Administrator Console
          </span>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--ink)" }}>Placement Assessment Metrics</h1>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.95rem" }}>
            Real-time candidate results, proctoring violations, and email reporting
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="card">
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Registered Candidates</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "800" }}>{stats?.totalUsers || 0}</h2>
            <div style={{ background: "#eff6ff", padding: "0.6rem", borderRadius: "8px", color: "#2563eb" }}>
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="card">
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Completed Rounds</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--success)" }}>{stats?.completed || 0}</h2>
            <div style={{ background: "#ecfdf5", padding: "0.6rem", borderRadius: "8px", color: "var(--success)" }}>
              <CheckCircle size={22} />
            </div>
          </div>
        </div>

        <div className="card">
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Terminations (Violations)</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--danger)" }}>{stats?.terminated || 0}</h2>
            <div style={{ background: "#fef2f2", padding: "0.6rem", borderRadius: "8px", color: "var(--danger)" }}>
              <AlertOctagon size={22} />
            </div>
          </div>
        </div>

        <div className="card">
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Platform Avg Score</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent)" }}>{stats?.averageScore || 0}%</h2>
            <div style={{ background: "var(--accent-light)", padding: "0.6rem", borderRadius: "8px", color: "var(--accent)" }}>
              <TrendingUp size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="card">
        <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "1rem" }}>All Candidate Attempts</h3>
        {(!results || results.length === 0) ? (
          <p style={{ color: "var(--ink-secondary)", textAlign: "center", padding: "2rem 0" }}>No interview attempts recorded.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--ink-secondary)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>Candidate</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Round</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Score</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Date</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ fontWeight: "600" }}>{r.user?.name || "Candidate"}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--ink-secondary)" }}>{r.user?.email || "No email"}</div>
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div>{r.category}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--ink-secondary)" }}>{r.role}</div>
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span className={`badge ${r.status === "terminated" ? "badge-danger" : r.score >= 60 ? "badge-success" : "badge-warning"}`}>
                        {r.score}%
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", textTransform: "capitalize" }}>
                      {r.status}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "var(--ink-secondary)" }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        <Link to={`/interview/result/${r._id}`} className="btn btn-secondary btn-sm" title="View details">
                          <ExternalLink size={14} /> View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleMail(r._id)}
                          className="btn btn-secondary btn-sm"
                          title="Mail score report to candidate"
                        >
                          <Mail size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r._id)}
                          className="btn btn-danger btn-sm"
                          title="Delete record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

