const InterviewResult = require("../models/InterviewResult");
const {
  generateRoundQuestions,
  evaluateRound,
  generateQualificationEmail
} = require("../services/aiService");
const { generateInterviewReport } = require("../services/reportService");
const { sendCustomMail, sendViolationMail } = require("../services/emailService");
const { rounds, technicalCategories, technicalSubcategories } = require("../services/interviewConfig");

function cleanRound(value) {
  return rounds[value] ? value : "aptitude";
}

function cleanSubcategory(value) {
  return technicalSubcategories.includes(value) ? value : "MERN Stack Developer";
}

async function getProgress(userId) {
  const completed = await InterviewResult.listProgress(userId);

  const aptitudePassed = completed.some((item) => item.roundKey === "aptitude" && item.score >= 60);
  const technicalPassed = completed.some((item) => item.roundKey === "technical" && item.score >= 60);
  const voicePassed = completed.some((item) => item.roundKey === "voice" && item.score >= 60);
  const latestTechnical = completed.filter((item) => item.roundKey === "technical").slice(-1)[0];

  return {
    aptitude: true,
    technical: aptitudePassed,
    voice: technicalPassed,
    qualified: aptitudePassed && technicalPassed && voicePassed,
    subcategory: latestTechnical ? latestTechnical.role : ""
  };
}

async function getRecentQuestionTexts(userId, roundKey, role) {
  const attempts = await InterviewResult.listRecentQuestions(userId, roundKey, role);

  return attempts
    .flatMap((attempt) => attempt.answers || [])
    .map((answer) => answer.question)
    .filter(Boolean)
    .slice(0, 50);
}

// In-memory active exam sessions cache (allows stateless API requests)
const activeExams = new Map();

exports.getCategories = async (req, res) => {
  res.json({
    rounds,
    technicalCategories,
    technicalSubcategories
  });
};

exports.getStatus = async (req, res) => {
  try {
    const progress = await getProgress(req.user._id);
    res.json({ progress, rounds });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch interview status." });
  }
};

exports.start = async (req, res) => {
  try {
    const roundKey = cleanRound(req.body.roundKey || req.body.round || req.query.round);
    const progress = await getProgress(req.user._id);

    if (!progress[roundKey]) {
      return res.status(403).json({
        error: `Round locked. You must complete and pass (score >= 60%) the previous round first.`
      });
    }

    const subcategory =
      roundKey === "technical"
        ? cleanSubcategory(req.body.subcategory || req.query.subcategory)
        : "";
    const round = rounds[roundKey];
    const role = subcategory || round.title;

    const previousQuestions = await getRecentQuestionTexts(req.user._id, roundKey, role);
    const questions = await generateRoundQuestions({
      roundKey,
      subcategory,
      previousQuestions,
      candidateId: String(req.user._id)
    });

    const examId = `${req.user._id}_${Date.now()}`;
    const examData = {
      examId,
      userId: String(req.user._id),
      roundKey,
      category: round.category,
      role,
      difficulty: "Medium",
      durationMinutes: round.durationMinutes,
      questions,
      startedAt: Date.now()
    };

    activeExams.set(examId, examData);
    if (req.session) {
      req.session.interview = examData;
    }

    res.json({
      success: true,
      examId,
      roundKey,
      roundTitle: round.title,
      category: round.category,
      role,
      difficulty: "Medium",
      durationMinutes: round.durationMinutes,
      questions,
      voiceEnabled: roundKey === "voice"
    });
  } catch (error) {
    console.error("API start round error:", error);
    res.status(500).json({ error: "Failed to generate interview questions: " + error.message });
  }
};

exports.submit = async (req, res) => {
  try {
    const { examId, submittedAnswers, securityEvents = [], voiceTranscript = "", webcamEnabled, screenShareEnabled } = req.body;
    let examData = activeExams.get(examId);

    if (!examData && req.session && req.session.interview) {
      examData = req.session.interview;
    }

    if (!examData) {
      return res.status(400).json({ error: "Exam session expired or not found. Please restart the round." });
    }

    const durationSeconds = Math.round((Date.now() - examData.startedAt) / 1000);

    const evaluation = await evaluateRound({
      round: examData.category,
      questions: examData.questions,
      submittedAnswers: submittedAnswers || [],
      subcategory: examData.role
    });

    const parsedSecurityEvents = Array.isArray(securityEvents)
      ? securityEvents
      : typeof securityEvents === "string"
      ? securityEvents.split("\n").filter(Boolean)
      : [];

    const result = await InterviewResult.create({
      user: req.user._id,
      roundKey: examData.roundKey,
      category: examData.category,
      role: examData.role,
      difficulty: examData.difficulty,
      score: evaluation.score,
      answers: evaluation.answers,
      summary: evaluation.summary,
      durationSeconds,
      status: "completed",
      securityEvents: parsedSecurityEvents,
      voiceTranscript: String(voiceTranscript || "").slice(0, 4000),
      proctoringSummary: {
        webcamEnabled: Boolean(webcamEnabled),
        screenShareEnabled: Boolean(screenShareEnabled),
        eventCount: parsedSecurityEvents.length
      }
    });

    // Check qualification upon completing voice round
    if (examData.roundKey === "voice" && evaluation.score >= 60) {
      const completed = await InterviewResult.listCompletedForUser(req.user._id, [
        "aptitude",
        "technical",
        "voice"
      ]);
      const hasAptitude = completed.some((i) => i.roundKey === "aptitude" && i.score >= 60);
      const technical = completed.find((i) => i.roundKey === "technical" && i.score >= 60);
      const hasVoice = completed.some((i) => i.roundKey === "voice" && i.score >= 60);

      if (hasAptitude && technical && hasVoice) {
        const text = await generateQualificationEmail({
          user: req.user,
          subcategory: technical.role,
          results: completed
        });
        await sendCustomMail({
          to: req.user.email,
          subject: "Congratulations! You have qualified the AI Interview Assessment",
          text
        });
      }
    }

    activeExams.delete(examId);
    if (req.session) {
      req.session.interview = null;
    }

    res.json({
      success: true,
      resultId: result._id,
      score: result.score,
      summary: result.summary,
      status: result.status,
      answers: result.answers
    });
  } catch (error) {
    console.error("API submit exam error:", error);
    res.status(500).json({ error: "Failed to evaluate round: " + error.message });
  }
};

exports.terminate = async (req, res) => {
  try {
    const { examId, reason = "Security policy violation", securityEvents = [] } = req.body;
    let examData = activeExams.get(examId);

    if (!examData && req.session && req.session.interview) {
      examData = req.session.interview;
    }

    if (!examData) {
      return res.status(400).json({ error: "No active interview session." });
    }

    const durationSeconds = Math.round((Date.now() - examData.startedAt) / 1000);
    const parsedEvents = Array.isArray(securityEvents)
      ? securityEvents
      : [reason];

    const result = await InterviewResult.create({
      user: req.user._id,
      roundKey: examData.roundKey,
      category: examData.category,
      role: examData.role,
      difficulty: examData.difficulty,
      score: 0,
      answers: [],
      summary: `Exam terminated automatically. Reason: ${reason}`,
      durationSeconds,
      status: "terminated",
      terminationReason: String(reason).slice(0, 300),
      securityEvents: parsedEvents
    });

    await sendViolationMail(req.user, reason);

    activeExams.delete(examId);
    if (req.session) {
      req.session.interview = null;
    }

    res.json({
      success: true,
      terminated: true,
      resultId: result._id,
      reason
    });
  } catch (error) {
    console.error("API terminate exam error:", error);
    res.status(500).json({ error: "Failed to terminate exam." });
  }
};

exports.getResult = async (req, res) => {
  try {
    const result = await InterviewResult.findOwned(req.params.id, req.user._id);
    if (!result) {
      return res.status(404).json({ error: "Interview result not found." });
    }

    const progress = await getProgress(req.user._id);
    res.json({
      result,
      progress,
      rounds
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve result." });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const result = await InterviewResult.findOwned(req.params.id, req.user._id);
    if (!result) {
      return res.status(404).json({ error: "Result not found." });
    }

    generateInterviewReport(result, req.user, res);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate PDF report." });
  }
};

