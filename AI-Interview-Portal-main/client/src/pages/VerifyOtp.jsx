import React, { useState } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const emailParam = searchParams.get("email") || "";
  const [email] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // If local dev environment without SMTP configured, display devOtp banner
  const devOtp = location.state?.devOtp;

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await authApi.verifyOtp({ email, otp: otp.trim() });
      if (res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await authApi.resendOtp({ email });
      setSuccess("A fresh 6-digit OTP code has been dispatched.");
      if (res.data.devOtp) {
        setSuccess(`New code sent! (Dev OTP: ${res.data.devOtp})`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend code.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ background: "var(--accent-light)", width: "48px", height: "48px", borderRadius: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: "0.75rem" }}>
            <KeyRound size={24} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--ink)" }}>Verify Your Email</h1>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.9rem" }}>
            Enter the 6-digit code sent to <br />
            <strong>{email || "your email address"}</strong>
          </p>
        </div>

        {devOtp && (
          <div className="alert alert-info">
            <span><strong>Local Dev Notice:</strong> Your OTP code is <code>{devOtp}</code></span>
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
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label">6-Digit OTP Code</label>
            <input
              type="text"
              maxLength={6}
              className="form-control"
              placeholder="123456"
              style={{ fontSize: "1.3rem", letterSpacing: "6px", textAlign: "center" }}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
            {loading ? "Verifying..." : "Verify & Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button type="button" onClick={handleResend} className="btn btn-secondary btn-sm">
            Resend OTP Code
          </button>
        </div>
      </div>
    </div>
  );
}

