import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { interviewApi } from "../api/apiClient";
import { Award, FileDown, CheckCircle2, XCircle, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

export default function ResultView() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    interviewApi
      .getResult(id)
      .then((res) => {
        setResult(res.data.result);
        setProgress(res.data.progress);
      })
      .catch((err) => {
        console.error("Result fetch error:", err);
        setError("Unable to find interview result.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p>Loading result report...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <div className="alert alert-danger" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <span>{error || "Result not found"}</span>
        </div>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isTerminated = result.status === "terminated";
  const isPassed = !isTerminated && result.score >= 60;

  return (
    <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "900px" }}>
      {/* Top Header Card */}
      <div className="card" style={{ marginBottom: "2rem", textAlign: "center", padding: "2.5rem 2rem" }}>
        <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "1rem" }}>
          {isTerminated ? (
            <div style={{ background: "#fee2e2", padding: "1rem", borderRadius: "50%", color: "var(--danger)" }}>
              <XCircle size={48} />
            </div>
          ) : isPassed ? (
            <div style={{ background: "#d1fae5", padding: "1rem", borderRadius: "50%", color: "var(--success)" }}>
              <CheckCircle2 size={48} />
            </div>
          ) : (
            <div style={{ background: "#fef3c7", padding: "1rem", borderRadius: "50%", color: "var(--warning)" }}>
              <Award size={48} />
            </div>
          )}
        </div>

        <span className="badge badge-accent" style={{ textTransform: "uppercase" }}>
          {result.category} &bull; {result.role}
        </span>

        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0.5rem 0", color: "var(--ink)" }}>
          {result.score}%
        </h1>

        <p style={{ fontSize: "1.1rem", fontWeight: "700", color: isTerminated ? "var(--danger)" : isPassed ? "var(--success)" : "var(--warning)" }}>
          {isTerminated
            ? `Assessment Terminated: ${result.terminationReason || "Security Violation"}`
            : isPassed
            ? "Congratulations! You Qualified This Round"
            : "Round Incomplete: Score below 60% requirement"}
        </p>

        <p style={{ color: "var(--ink-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0.5rem auto 1.5rem auto" }}>
          {result.summary || "Evaluation completed."}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <a
            href={interviewApi.downloadReportUrl(result._id)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            <FileDown size={18} /> Download Official PDF Report
          </a>

          {isPassed && (
            <Link to="/interview" className="btn btn-secondary">
              Proceed to Next Round <ArrowRight size={18} />
            </Link>
          )}

          <Link to="/dashboard" className="btn btn-secondary">
            Candidate Dashboard
          </Link>
        </div>
      </div>

      {/* Security Logs if any */}
      {result.securityEvents?.length > 0 && (
        <div className="card" style={{ marginBottom: "2rem", borderColor: isTerminated ? "#fca5a5" : "var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: isTerminated ? "var(--danger)" : "var(--ink)" }}>
            <ShieldAlert size={20} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Proctoring Activity Logs</h2>
          </div>
          <ul style={{ listStyle: "none", fontSize: "0.85rem", color: "var(--ink-secondary)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {result.securityEvents.map((event, idx) => (
              <li key={idx} style={{ padding: "0.4rem 0.6rem", background: "#f8fafc", borderRadius: "6px", fontFamily: "monospace" }}>
                {event}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Question Feedback Breakdown */}
      {result.answers?.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Sparkles size={20} color="var(--accent)" />
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800" }}>Detailed Question Breakdown & AI Feedback</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {result.answers.map((item, idx) => (
              <div key={idx} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.75rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>
                    Q{idx + 1}: {item.question}
                  </h3>
                  <span className={`badge ${Number(item.score) >= 60 ? "badge-success" : "badge-warning"}`}>
                    Score: {item.score}%
                  </span>
                </div>

                <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                  <strong>Submitted Response: </strong>
                  <span style={{ color: item.answer ? "inherit" : "var(--ink-secondary)" }}>
                    {item.answer || "No answer provided"}
                  </span>
                </div>

                {item.feedback && (
                  <p style={{ fontSize: "0.88rem", color: "var(--ink-secondary)", marginBottom: "0.5rem" }}>
                    <strong>Feedback:</strong> {item.feedback}
                  </p>
                )}

                {item.tips && item.tips.length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--accent-hover)", marginBottom: "0.25rem" }}>
                      Improvement Recommendations:
                    </p>
                    <ul style={{ paddingLeft: "1.25rem", fontSize: "0.82rem", color: "var(--ink-secondary)" }}>
                      {item.tips.map((tip, tipIdx) => (
                        <li key={tipIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

