import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { interviewApi } from "../api/apiClient";
import { useProctoring } from "../hooks/useProctoring";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { Shield, Clock, Video, Mic, AlertTriangle, Send, CheckCircle } from "lucide-react";

export default function InterviewRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const examSession = location.state?.examSession;

  // Redirect if no active session
  useEffect(() => {
    if (!examSession) {
      navigate("/interview", { replace: true });
    }
  }, [examSession, navigate]);

  const [answers, setAnswers] = useState(() => {
    return examSession?.questions?.map(() => "") || [];
  });
  const [voiceTranscripts, setVoiceTranscripts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  // Timer countdown
  const durationSeconds = (examSession?.durationMinutes || 10) * 60;
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  // Handler for automated anti-cheat termination
  const handleTermination = useCallback(
    async (reason) => {
      if (isTerminated || submitting) return;
      setIsTerminated(true);

      try {
        const res = await interviewApi.terminate({
          examId: examSession.examId,
          reason,
          securityEvents: [reason]
        });
        if (res.data.resultId) {
          navigate(`/interview/result/${res.data.resultId}`);
        } else {
          navigate("/interview");
        }
      } catch (err) {
        navigate("/interview");
      }
    },
    [isTerminated, submitting, examSession, navigate]
  );

  // Proctoring hook
  const {
    isActive: isProctoringActive,
    videoRef,
    warningCount,
    securityEvents,
    webcamEnabled,
    screenShareEnabled,
    enableProctoring
  } = useProctoring({
    onTerminate: handleTermination,
    maxWarnings: 4
  });

  // Speech Recognition hook for Voice round
  const handleTranscriptChange = useCallback((questionIndex, newText) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[questionIndex] = newText;
      return copy;
    });
    setVoiceTranscripts((prev) => [...prev, `${new Date().toISOString()} - Q${questionIndex + 1}: ${newText}`]);
  }, []);

  const {
    isListening,
    activeQuestionIndex,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onTranscriptChange: handleTranscriptChange
  });

  // Handle final submission
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (submitting || isTerminated) return;
      setSubmitting(true);

      try {
        const res = await interviewApi.submit({
          examId: examSession.examId,
          submittedAnswers: answers,
          securityEvents,
          voiceTranscript: voiceTranscripts.join("\n"),
          webcamEnabled,
          screenShareEnabled
        });

        if (res.data.resultId) {
          navigate(`/interview/result/${res.data.resultId}`);
        }
      } catch (err) {
        alert("Failed to submit exam: " + (err.response?.data?.error || err.message));
        setSubmitting(false);
      }
    },
    [
      submitting,
      isTerminated,
      examSession,
      answers,
      securityEvents,
      voiceTranscripts,
      webcamEnabled,
      screenShareEnabled,
      navigate
    ]
  );

  // Timer interval
  useEffect(() => {
    if (!examSession) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examSession, handleSubmit]);

  if (!examSession) return null;

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  return (
    <div className="container" style={{ padding: "2rem 1.5rem", maxWidth: "1000px" }}>
      {/* Sticky Top Proctoring & Timer Header */}
      <div style={{ position: "sticky", top: "70px", zIndex: 40, marginBottom: "2rem" }}>
        <div className="proctor-banner">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="camera-preview-box">
              <video ref={videoRef} autoPlay muted playsInline />
              {!webcamEnabled && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", padding: "4px" }}>
                  Camera Off
                </div>
              )}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                <Shield size={18} color="#0ea5a3" />
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff" }}>
                  {examSession.roundTitle} ({examSession.role})
                </h2>
              </div>
              <p style={{ color: "#9ca3af", fontSize: "0.82rem", maxWidth: "420px" }}>
                Strict proctoring active. Do not switch tabs, minimize window, or disconnect screenshare.
              </p>
              {!isProctoringActive && (
                <button
                  type="button"
                  onClick={enableProctoring}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: "0.5rem" }}
                >
                  <Video size={14} /> Enable Camera & Screen Share
                </button>
              )}
              {isProctoringActive && (
                <span className="badge badge-success" style={{ marginTop: "0.4rem" }}>
                  <CheckCircle size={12} /> Proctoring Live
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.3rem", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.3rem" }}>
              <Clock size={14} /> Time Remaining
            </div>
            <div className="timer-box">
              {minutes}:{seconds}
            </div>
          </div>
        </div>
      </div>

      {/* Questions list */}
      <form onSubmit={handleSubmit}>
        {examSession.questions?.map((q, idx) => (
          <div key={idx} className="question-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--ink)", lineHeight: "1.4" }}>
                {idx + 1}. {q.question}
              </h3>
              <span className="badge badge-accent" style={{ textTransform: "uppercase" }}>
                {q.type} &bull; {q.difficulty || "Medium"}
              </span>
            </div>

            {/* MCQ Type */}
            {q.type === "mcq" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {q.options?.map((opt, optIdx) => {
                  const isSelected = answers[idx] === opt;
                  return (
                    <label
                      key={optIdx}
                      className={`option-row ${isSelected ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`q_${idx}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(idx, opt)}
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <span style={{ fontSize: "0.95rem" }}>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Coding Type */}
            {q.type === "coding" && (
              <div>
                <textarea
                  className="form-control"
                  style={{ fontFamily: "monospace", fontSize: "0.9rem", minHeight: "180px", background: "#f8fafc" }}
                  placeholder="Write your solution approach, algorithm, or code implementation here..."
                  value={answers[idx]}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                />
              </div>
            )}

            {/* Written / Voice Type */}
            {q.type !== "mcq" && q.type !== "coding" && (
              <div>
                {examSession.voiceEnabled && (
                  <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${isListening && activeQuestionIndex === idx ? "btn-danger" : "btn-secondary"}`}
                      onClick={() => startListening(idx, answers[idx])}
                    >
                      <Mic size={14} />
                      {isListening && activeQuestionIndex === idx ? "Stop Voice Recording" : "Speak Answer (Voice)"}
                    </button>
                    {isListening && activeQuestionIndex === idx && (
                      <span style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: "600" }}>
                        Listening live... Speak clearly into microphone
                      </span>
                    )}
                  </div>
                )}
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Type your response here..."
                  value={answers[idx]}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "var(--ink-secondary)", fontSize: "0.9rem" }}>
            Ensure all answers are answered to the best of your ability before submitting.
          </p>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting || isTerminated}
          >
            <Send size={18} /> {submitting ? "Evaluating Exam..." : "Submit Round"}
          </button>
        </div>
      </form>
    </div>
  );
}

