import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi, interviewApi } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { PlayCircle, Award, Target, TrendingUp, AlertTriangle, FileDown, ExternalLink } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load dashboard stats", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p>Loading candidate dashboard...</p>
      </div>
    );
  }

  const chartData = {
    labels: data?.chart?.labels?.length ? data.chart.labels : ["Initial"],
    datasets: [
      {
        label: "Score (%)",
        data: data?.chart?.scores?.length ? data.chart.scores : [0],
        borderColor: "#0ea5a3",
        backgroundColor: "rgba(14, 165, 163, 0.12)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#0ea5a3",
        pointRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <span className="badge badge-accent" style={{ marginBottom: "0.4rem" }}>Candidate Overview</span>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--ink)" }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.95rem" }}>
            Track your performance metrics, exam logs, and sequential unlock status
          </p>
        </div>
        <Link to="/interview" className="btn btn-primary btn-lg">
          <PlayCircle size={20} /> Start New Round
        </Link>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Total Attempts</p>
              <h2 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "0.2rem" }}>{data?.stats?.totalInterviews || 0}</h2>
            </div>
            <div style={{ background: "var(--accent-light)", padding: "0.75rem", borderRadius: "10px", color: "var(--accent)" }}>
              <Target size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Average Score</p>
              <h2 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "0.2rem" }}>{data?.stats?.averageScore || 0}%</h2>
            </div>
            <div style={{ background: "#ecfdf5", padding: "0.75rem", borderRadius: "10px", color: "#059669" }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Best Score</p>
              <h2 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "0.2rem" }}>{data?.stats?.bestScore || 0}%</h2>
            </div>
            <div style={{ background: "#eff6ff", padding: "0.75rem", borderRadius: "10px", color: "#2563eb" }}>
              <Award size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase" }}>Security Violations</p>
              <h2 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "0.2rem", color: data?.stats?.terminatedCount ? "var(--danger)" : "inherit" }}>
                {data?.stats?.terminatedCount || 0}
              </h2>
            </div>
            <div style={{ background: "#fef2f2", padding: "0.75rem", borderRadius: "10px", color: "var(--danger)" }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>Performance Trajectory</h3>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem" }}>Progression history across completed interview rounds</p>
          </div>
          <span className="badge badge-accent">Passing threshold: 60%</span>
        </div>
        <div style={{ height: "240px" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Interview History Table */}
      <div className="card">
        <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "1rem" }}>Past Interview Attempts</h3>
        {(!data?.results || data.results.length === 0) ? (
          <div style={{ textAlign: "center", padding: "2.5rem 0", color: "var(--ink-secondary)" }}>
            <p>No attempts recorded yet. Start your first round above!</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.92rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--ink-secondary)" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>Round</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Role/Topic</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Score</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Date</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((r) => {
                  const isPassed = r.status === "completed" && r.score >= 60;
                  return (
                    <tr key={r._id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: "600" }}>{r.category}</td>
                      <td style={{ padding: "0.85rem 1rem", color: "var(--ink-secondary)" }}>{r.role || "General"}</td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span
                          className={`badge ${
                            r.status === "terminated"
                              ? "badge-danger"
                              : isPassed
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {r.status === "terminated" ? "0% (Terminated)" : `${r.score}%`}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{ textTransform: "capitalize", fontSize: "0.85rem" }}>{r.status}</span>
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "var(--ink-secondary)" }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                          <Link to={`/interview/result/${r._id}`} className="btn btn-secondary btn-sm" title="View details">
                            <ExternalLink size={14} /> Review
                          </Link>
                          {r.status === "completed" && (
                            <a
                              href={interviewApi.downloadReportUrl(r._id)}
                              className="btn btn-secondary btn-sm"
                              title="Download PDF"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FileDown size={14} /> PDF
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

