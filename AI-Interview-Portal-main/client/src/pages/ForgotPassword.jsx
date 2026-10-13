import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/apiClient";
import { HelpCircle, AlertCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email });
      navigate(`/reset-password?email=${encodeURIComponent(email)}`, {
        state: { devOtp: res.data.devOtp }
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ background: "var(--accent-light)", width: "48px", height: "48px", borderRadius: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: "0.75rem" }}>
            <HelpCircle size={24} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--ink)" }}>Reset Password</h1>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.9rem" }}>Enter your registered email to receive a reset code</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          Remembered your password? <Link to="/login" style={{ fontWeight: "700" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

