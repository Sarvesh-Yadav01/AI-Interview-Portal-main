const InterviewResult = require("../models/InterviewResult");

exports.getStats = async (req, res) => {
  try {
    const results = await InterviewResult.find({ user: req.user._id }).sort({ createdAt: -1 });

    const totalInterviews = results.length;
    const completedResults = results.filter((r) => r.status === "completed");
    const scores = completedResults.map((r) => Number(r.score || 0));

    const averageScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const bestScore = scores.length ? Math.max(...scores) : 0;

    // Build timeline for chart (oldest to newest)
    const reversed = [...completedResults].reverse();
    const chartLabels = reversed.map((r) =>
      new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
    const chartScores = reversed.map((r) => r.score);

    res.json({
      stats: {
        totalInterviews,
        averageScore,
        bestScore,
        completedCount: completedResults.length,
        terminatedCount: totalInterviews - completedResults.length
      },
      chart: {
        labels: chartLabels,
        scores: chartScores
      },
      results: results.slice(0, 30)
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics." });
  }
};

