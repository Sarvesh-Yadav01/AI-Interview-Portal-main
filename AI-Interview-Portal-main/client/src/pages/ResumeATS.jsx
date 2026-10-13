import React, { useState, useEffect } from "react";
import { resumeApi } from "../api/apiClient";
import { FileText, UploadCloud, CheckCircle2, AlertCircle, Sparkles, Target } from "lucide-react";

export default function ResumeATS() {
  const [resumeData, setResumeData] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    resumeApi
      .getMyResume()
      .then((res) => {
        if (res.data.resume) {
          setResumeData(res.data.resume);
        }
      })
      .catch((err) => console.error("Error fetching existing resume", err))
      .finally(() => setFetching(false));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await resumeApi.uploadResume(formData);
      setResumeData(res.data.resume);
      setSuccess("Resume analyzed successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "860px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <span className="badge badge-accent" style={{ marginBottom: "0.4rem" }}>AI Screening Tool</span>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--ink)" }}>Resume ATS Score & Analysis</h1>
        <p style={{ color: "var(--ink-secondary)", fontSize: "1rem" }}>
          Upload your PDF resume to receive an ATS compatibility score, role alignment feedback, and keyword optimization tips.
        </p>
      </div>

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

      {/* Upload Box */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <form onSubmit={handleUpload}>
          <div
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "12px",
              padding: "2.5rem 1.5rem",
              textAlign: "center",
              background: "#fafafa",
              cursor: "pointer",
              marginBottom: "1.25rem"
            }}
            onClick={() => document.getElementById("resumeInput").click()}
          >
            <UploadCloud size={44} color="#0ea5a3" style={{ marginBottom: "0.75rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.25rem" }}>
              {file ? file.name : "Click or Drag & Drop your PDF Resume here"}
            </h3>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.85rem" }}>
              Accepts .PDF files up to 5MB
            </p>
            <input
              id="resumeInput"
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || loading}
            >
              <Sparkles size={16} /> {loading ? "Analyzing Resume with AI..." : "Analyze ATS Score"}
            </button>
          </div>
        </form>
      </div>

      {/* ATS Result Panel */}
      {resumeData && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
            <div>
              <span className="badge badge-accent">ATS Evaluation Report</span>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", marginTop: "0.25rem" }}>
                {resumeData.filename || "Uploaded Resume"}
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--ink-secondary)" }}>ATS Compatibility</span>
              <div style={{ fontSize: "2.25rem", fontWeight: "900", color: resumeData.atsScore >= 70 ? "var(--success)" : "var(--warning)" }}>
                {resumeData.atsScore || resumeData.score || 75}%
              </div>
            </div>
          </div>

          {resumeData.feedback && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.5rem" }}>Executive Feedback</h3>
              <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", lineHeight: "1.6" }}>
                {resumeData.feedback}
              </p>
            </div>
          )}

          {resumeData.strengths && resumeData.strengths.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--success)" }}>
                Key Strengths Detected
              </h3>
              <ul style={{ paddingLeft: "1.25rem", fontSize: "0.9rem", color: "var(--ink-secondary)" }}>
                {resumeData.strengths.map((str, idx) => (
                  <li key={idx} style={{ marginBottom: "0.25rem" }}>{str}</li>
                ))}
              </ul>
            </div>
          )}

          {resumeData.suggestions && resumeData.suggestions.length > 0 && (
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--accent)" }}>
                Optimization Suggestions
              </h3>
              <ul style={{ paddingLeft: "1.25rem", fontSize: "0.9rem", color: "var(--ink-secondary)" }}>
                {resumeData.suggestions.map((sug, idx) => (
                  <li key={idx} style={{ marginBottom: "0.25rem" }}>{sug}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

