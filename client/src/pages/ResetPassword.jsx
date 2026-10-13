import React, { useState } from "react";
import { useSearchParams, useLocation, useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/apiClient";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [email] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const devOtp = location.state?.devOtp;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ email, otp: otp.trim(), password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Password reset failed. Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ background: "var(--accent-light)", width: "48px", height: "48px", borderRadius: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: "0.75rem" }}>
            <Lock size={24} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--ink)" }}>Choose New Password</h1>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.9rem" }}>
            Enter OTP and your new password for <strong>{email}</strong>
          </p>
        </div>

        {devOtp && (
          <div className="alert alert-info">
            <span><strong>Dev Notice:</strong> Your Reset Code is <code>{devOtp}</code></span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>Password reset successful! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">6-Digit Reset Code</label>
            <input
              type="text"
              maxLength={6}
              className="form-control"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          <Link to="/login">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

