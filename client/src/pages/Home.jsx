import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Video, Mic, FileCheck, ArrowRight, BrainCircuit, CheckCircle } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: "linear-gradient(135deg, #ffffff 0%, #eef8f7 65%, #fff4db 100%)", padding: "4.5rem 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "860px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--accent-light)", padding: "0.4rem 1rem", borderRadius: "999px", color: "var(--accent-hover)", fontWeight: "700", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            <BrainCircuit size={16} /> NEXT-GEN MERN AI INTERVIEW PLATFORM
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: "900", lineHeight: "1.2", marginBottom: "1.25rem", color: "var(--ink)" }}>
            Crack Placements with <span style={{ color: "var(--accent)" }}>AI-Proctored</span> Real-Time Interviews
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--ink-secondary)", marginBottom: "2rem", lineHeight: "1.6" }}>
            Experience an end-to-end recruitment pipeline: sequential screening, role-specific technical assessments, voice interview with speech-to-text, strict webcam & screen proctoring, and ATS resume scoring.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            {isAuthenticated ? (
              <Link to="/interview" className="btn btn-primary btn-lg">
                Enter Interview Suite <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Your Assessment <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 3-Round Pipeline Highlights */}
      <section className="container" style={{ padding: "4rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "0.5rem" }}>Comprehensive 3-Stage Interview Pipeline</h2>
          <p style={{ color: "var(--ink-secondary)" }}>Rounds unlock sequentially. Candidates must score at least 60% to progress.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {/* Round 1 */}
          <div className="card">
            <div style={{ background: "#eff6ff", width: "48px", height: "48px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e40af", marginBottom: "1.25rem" }}>
              <FileCheck size={24} />
            </div>
            <div className="badge badge-accent" style={{ marginBottom: "0.75rem" }}>Round 1</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>Aptitude & Reasoning</h3>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", lineHeight: "1.5" }}>
              10 industry-standard MCQs covering quantitative math, logical puzzles, and verbal reasoning. Passing score: 60%.
            </p>
          </div>

          {/* Round 2 */}
          <div className="card">
            <div style={{ background: "#ecfdf5", width: "48px", height: "48px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#065f46", marginBottom: "1.25rem" }}>
              <BrainCircuit size={24} />
            </div>
            <div className="badge badge-success" style={{ marginBottom: "0.75rem" }}>Round 2</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>Technical Specialization</h3>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", lineHeight: "1.5" }}>
              Role-focused questions across 60+ domains (MERN Stack, Python, Java, DevOps, GenAI, DSA). 7 MCQs + 3 in-depth written questions.
            </p>
          </div>

          {/* Round 3 */}
          <div className="card">
            <div style={{ background: "#fef3c7", width: "48px", height: "48px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#92400e", marginBottom: "1.25rem" }}>
              <Mic size={24} />
            </div>
            <div className="badge badge-warning" style={{ marginBottom: "0.75rem" }}>Round 3</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>Voice HR & Behavioral</h3>
            <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", lineHeight: "1.5" }}>
              Real-time browser speech-to-text audio capture analyzing communication fluency, confidence, problem resolution, and situational fit.
            </p>
          </div>
        </div>
      </section>

      {/* Proctored Security Highlights */}
      <section style={{ background: "#111827", color: "#ffffff", padding: "4rem 0" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--accent)", fontWeight: "700", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              <ShieldCheck size={18} /> ENTERPRISE PROCTORING
            </div>
            <h2 style={{ fontSize: "2.25rem", fontWeight: "800", marginBottom: "1rem", lineHeight: "1.25" }}>
              Strict Anti-Cheat & Continuous Live Monitoring
            </h2>
            <p style={{ color: "#9ca3af", marginBottom: "1.5rem", lineHeight: "1.6" }}>
              Built to mimic top corporate recruitment testing environments. Any unauthorized attempts automatically log security violations.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.85rem", color: "#e5e7eb" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <CheckCircle size={18} color="#0ea5a3" /> Full screen-sharing requirement with immediate auto-terminate upon stopping.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <CheckCircle size={18} color="#0ea5a3" /> Continuous camera presence detection and multi-level warning system.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <CheckCircle size={18} color="#0ea5a3" /> Browser tab switch and window blur detection with automatic violation reporting.
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <CheckCircle size={18} color="#0ea5a3" /> Automated qualification and violation email notices dispatched via Nodemailer.
              </li>
            </ul>
          </div>
          <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "16px", padding: "2rem", textAlign: "center" }}>
            <Video size={48} color="#0ea5a3" style={{ marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "0.5rem" }}>Live Proctor Sandbox</h3>
            <p style={{ color: "#9ca3af", fontSize: "0.92rem", marginBottom: "1.5rem" }}>
              Both camera feed and screen stream run entirely in the browser using WebRTC MediaStreams without 3rd party plug-ins.
            </p>
            <Link to="/interview" className="btn btn-primary">
              Test System Requirements
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

