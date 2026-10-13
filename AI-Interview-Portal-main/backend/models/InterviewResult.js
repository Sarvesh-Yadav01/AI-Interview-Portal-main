const mongoose = require("mongoose");

const interviewResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    roundKey: {
      type: String,
      enum: ["aptitude", "technical", "aiQuestions", "voice", "coding", "legacy"],
      default: "legacy"
    },
    category: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "General Candidate"
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium"
    },
    score: {
      type: Number,
      default: 0
    },
    answers: {
      type: Array,
      default: []
    },
    summary: {
      type: String,
      default: null
    },
    durationSeconds: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ["completed", "terminated"],
      default: "completed"
    },
    terminationReason: {
      type: String,
      default: null
    },
    securityEvents: {
      type: [String],
      default: []
    },
    voiceTranscript: {
      type: String,
      default: null
    },
    proctoringSummary: {
      webcamEnabled: { type: Boolean, default: false },
      screenShareEnabled: { type: Boolean, default: false },
      eventCount: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

interviewResultSchema.index({ user: 1, createdAt: -1 });
interviewResultSchema.index({ status: 1 });

// Compatibility and convenience methods
interviewResultSchema.statics.listProgress = async function (userId) {
  const results = await this.find({
    user: userId,
    status: { $ne: "terminated" }
  })
    .sort({ createdAt: 1 })
    .select("roundKey score role createdAt");

  return results.map((r) => ({
    roundKey: r.roundKey,
    score: r.score,
    role: r.role,
    createdAt: r.createdAt
  }));
};

interviewResultSchema.statics.listRecentQuestions = async function (userId, roundKey, role) {
  const query = {
    user: userId,
    roundKey,
    status: { $ne: "terminated" }
  };
  if (role) {
    query.role = role;
  }

  const results = await this.find(query)
    .sort({ createdAt: -1 })
    .limit(5)
    .select("answers");

  return results;
};

interviewResultSchema.statics.listCompletedForUser = async function (userId, roundKeys = []) {
  const query = {
    user: userId,
    status: "completed"
  };
  if (roundKeys && roundKeys.length > 0) {
    query.roundKey = { $in: roundKeys };
  }

  return this.find(query).sort({ createdAt: -1 });
};

interviewResultSchema.statics.findOwned = function (id, userId) {
  return this.findOne({ _id: id, user: userId });
};

interviewResultSchema.statics.listLatestForAdmin = function () {
  return this.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(50);
};

interviewResultSchema.statics.findByIdWithUser = function (id) {
  return this.findById(id).populate("user", "name email");
};

interviewResultSchema.statics.countByStatus = function (status) {
  return this.countDocuments({ status });
};

interviewResultSchema.statics.deleteById = function (id) {
  return this.findByIdAndDelete(id);
};

const InterviewResult = mongoose.model("InterviewResult", interviewResultSchema);

module.exports = InterviewResult;
