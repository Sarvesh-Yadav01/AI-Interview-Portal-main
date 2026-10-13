import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { Shield, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminApi.login({ email, password });
      if (res.data.adminToken && res.data.admin) {
        adminLogin(res.data.adminToken, res.data.admin);
        navigate("/admin");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ background: "#fef3c7", width: "48px", height: "48px", borderRadius: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#b45309", marginBottom: "0.75rem" }}>
            <Shield size={24} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--ink)" }}>Administrator Sign In</h1>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.9rem" }}>Analytics and proctoring surveillance review</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
            {loading ? "Verifying..." : "Access Admin Console"}
          </button>
        </form>
      </div>
    </div>
  );
}

