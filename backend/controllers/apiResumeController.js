const fs = require("fs/promises");
const { extractResumeText } = require("../services/resumeService");
const { analyzeResume } = require("../services/aiService");
const User = require("../models/User");

exports.analyze = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Please upload a PDF resume file." });
  }

  try {
    const resumeText = await extractResumeText(req.file.path);
    const analysis = await analyzeResume(
      req.user.name,
      req.file.originalname,
      resumeText
    );

    const savedResume = {
      filename: req.file.originalname,
      uploadedAt: new Date(),
      ...analysis
    };

    await User.updateById(req.user._id, {
      resume: savedResume
    });

    // Clean up temporary upload
    try {
      await fs.unlink(req.file.path);
    } catch (e) {
      // ignore unlink error
    }

    res.json({
      success: true,
      resume: savedResume
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({ error: "Failed to parse resume: " + error.message });
  }
};

exports.getMyResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ resume: user ? user.resume : null });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resume." });
  }
};

