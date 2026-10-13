import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { interviewApi } from "../api/apiClient";
import { CheckCircle2, Lock, ArrowRight, BookOpen, Code2, Mic2 } from "lucide-react";

export default function SelectRound() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState("MERN Stack Developer");
  const [loading, setLoading] = useState(true);
  const [startingRound, setStartingRound] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([interviewApi.getStatus(), interviewApi.getCategories()])
      .then(([statusRes, catRes]) => {
        setData(statusRes.data);
        setCategories(catRes.data);
      })
      .catch((err) => {
        console.error("Failed to fetch interview setup:", err);
        setError("Failed to load interview rounds. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (roundKey) => {
    setError("");
    setStartingRound(roundKey);

    try {
      const res = await interviewApi.start({
        roundKey,
        subcategory: roundKey === "technical" ? selectedSubcategory : undefined
      });

      if (res.data.success) {
        // Navigate to the proctored interview room with exam session data
        navigate("/interview/room", { state: { examSession: res.data } });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not launch round.");
    } finally {
      setStartingRound(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p>Checking interview qualification status...</p>
      </div>
    );
  }

  const progress = data?.progress || { aptitude: true, technical: false, voice: false, qualified: false };

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <span className="badge badge-accent" style={{ marginBottom: "0.5rem" }}>Placement Evaluation Pipeline</span>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--ink)" }}>Interview Assessment Rounds</h1>
        <p style={{ color: "var(--ink-secondary)", fontSize: "1rem" }}>
          Rounds unlock sequentially. You need at least <strong>60%</strong> in each round to unlock the next stage.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: "2rem" }}>
          <span>{error}</span>
        </div>
      )}

      {/* Progress tracker pills */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", borderRadius: "999px", background: "#eef8f7", color: "var(--accent-hover)", fontWeight: "700", border: "1px solid var(--accent)" }}>
          <CheckCircle2 size={18} /> 1. Aptitude & Reasoning
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", borderRadius: "999px", background: progress.technical ? "#eef8f7" : "#f1f5f9", color: progress.technical ? "var(--accent-hover)" : "var(--ink-secondary)", fontWeight: "700", border: `1px solid ${progress.technical ? "var(--accent)" : "var(--border)"}` }}>
          {progress.technical ? <CheckCircle2 size={18} /> : <Lock size={16} />} 2. Technical Round
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", borderRadius: "999px", background: progress.voice ? "#eef8f7" : "#f1f5f9", color: progress.voice ? "var(--accent-hover)" : "var(--ink-secondary)", fontWeight: "700", border: `1px solid ${progress.voice ? "var(--accent)" : "var(--border)"}` }}>
          {progress.voice ? <CheckCircle2 size={18} /> : <Lock size={16} />} 3. Voice Interview
        </div>
      </div>

      {/* 3 Round Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem" }}>
        {/* Round 1: Aptitude */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ background: "#eff6ff", padding: "0.75rem", borderRadius: "10px", color: "#1e40af" }}>
                <BookOpen size={24} />
              </div>
              <span className="badge badge-accent">Round 1</span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "0.5rem" }}>Aptitude & Reasoning</h2>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", marginBottom: "1rem" }}>
              10 industry-calibrated MCQs testing quantitative analysis, verbal ability, and logical reasoning.
            </p>
            <div style={{ background: "var(--bg)", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", color: "var(--ink-secondary)", marginBottom: "1.5rem" }}>
              ⏱️ 10 Minutes &nbsp;|&nbsp; 10 MCQs &nbsp;|&nbsp; 60% Passing Mark
            </div>
          </div>
          <button
            onClick={() => handleStart("aptitude")}
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={startingRound === "aptitude"}
          >
            {startingRound === "aptitude" ? "Initializing..." : "Start Aptitude Round"} <ArrowRight size={16} />
          </button>
        </div>

        {/* Round 2: Technical */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: progress.technical ? 1 : 0.85 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ background: "#ecfdf5", padding: "0.75rem", borderRadius: "10px", color: "#065f46" }}>
                <Code2 size={24} />
              </div>
              <span className={`badge ${progress.technical ? "badge-success" : "badge-secondary"}`}>
                {progress.technical ? "Unlocked" : "Locked"}
              </span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "0.5rem" }}>Technical Round</h2>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", marginBottom: "1rem" }}>
              Select your domain. Assessment includes 7 MCQs and 3 architecture/coding questions.
            </p>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Select Specialization</label>
              <select
                className="form-control"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                disabled={!progress.technical}
              >
                {categories?.technicalCategories?.map((cat) => (
                  <optgroup key={cat.name} label={cat.name}>
                    {cat.subcategories.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div style={{ background: "var(--bg)", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", color: "var(--ink-secondary)", marginBottom: "1.5rem" }}>
              ⏱️ 10 Minutes &nbsp;|&nbsp; 7 MCQs + 3 Written &nbsp;|&nbsp; 60% Pass
            </div>
          </div>

          <button
            onClick={() => handleStart("technical")}
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={!progress.technical || startingRound === "technical"}
          >
            {startingRound === "technical"
              ? "Generating Round..."
              : progress.technical
              ? "Start Technical Round"
              : "Score ≥ 60% in Aptitude First"}
          </button>
        </div>

        {/* Round 3: Voice */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: progress.voice ? 1 : 0.85 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ background: "#fef3c7", padding: "0.75rem", borderRadius: "10px", color: "#92400e" }}>
                <Mic2 size={24} />
              </div>
              <span className={`badge ${progress.voice ? "badge-warning" : "badge-secondary"}`}>
                {progress.voice ? "Unlocked" : "Locked"}
              </span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "0.5rem" }}>Voice Interview</h2>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", marginBottom: "1rem" }}>
              Live spoken dialogue testing communication fluency, conflict handling, and culture fit with real-time speech capture.
            </p>
            <div style={{ background: "var(--bg)", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", color: "var(--ink-secondary)", marginBottom: "1.5rem" }}>
              ⏱️ 6 Minutes &nbsp;|&nbsp; 5 Spoken Questions &nbsp;|&nbsp; AI Speech-to-Text
            </div>
          </div>

          <button
            onClick={() => handleStart("voice")}
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={!progress.voice || startingRound === "voice"}
          >
            {startingRound === "voice"
              ? "Preparing Voice Session..."
              : progress.voice
              ? "Start Voice Interview"
              : "Score ≥ 60% in Technical First"}
          </button>
        </div>
      </div>
    </div>
  );
}

