const jwt = require("jsonwebtoken");
const User = require("../models/User");
const InterviewResult = require("../models/InterviewResult");
const { sendCustomMail } = require("../services/emailService");

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
const ADMIN_PASS = String(process.env.ADMIN_PASS || "admin12345678");

exports.login = (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    if (req.session) {
      req.session.adminAuthenticated = true;
    }
    const adminToken = jwt.sign(
      { role: "admin", email },
      process.env.JWT_SECRET || "ai_interview_default_jwt_secret_key_32chars",
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      adminToken,
      admin: { email, role: "admin" }
    });
  }

  res.status(401).json({ error: "Invalid admin email or password." });
};

exports.getStats = async (req, res) => {
  try {
    const [results, totalUsers, completed, terminated] = await Promise.all([
      InterviewResult.listLatestForAdmin(),
      User.countDocuments(),
      InterviewResult.countByStatus("completed"),
      InterviewResult.countByStatus("terminated")
    ]);

    const averageScore = results.length
      ? Math.round(results.reduce((sum, item) => sum + Number(item.score || 0), 0) / results.length)
      : 0;

    const roundCounts = results.reduce((acc, item) => {
      acc[item.roundKey] = (acc[item.roundKey] || 0) + 1;
      return acc;
    }, {});

    res.json({
      stats: {
        totalUsers,
        completed,
        terminated,
        averageScore
      },
      roundCounts,
      results
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to fetch admin dashboard data." });
  }
};

exports.getResult = async (req, res) => {
  try {
    const result = await InterviewResult.findByIdWithUser(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Result not found." });
    }
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch interview result." });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    await InterviewResult.deleteById(req.params.id);
    res.json({ success: true, message: "Interview record deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete record." });
  }
};

exports.mailCandidate = async (req, res) => {
  try {
    const result = await InterviewResult.findByIdWithUser(req.params.id);

    if (!result || !result.user) {
      return res.status(404).json({ error: "Candidate not found for this attempt." });
    }

    const delivery = await sendCustomMail({
      to: result.user.email,
      subject: `Interview Performance Report - ${result.category}`,
      text: `Dear ${result.user.name},\n\nYour ${result.category} (${result.role}) assessment result is available.\n\nScore: ${result.score}%\nStatus: ${result.status}\n\nSummary:\n${result.summary || "Report generated successfully."}\n\nBest regards,\nAI Interview Portal Team`
    });

    res.json({ success: true, message: "Report email dispatched to candidate.", delivery });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email to candidate." });
  }
};

