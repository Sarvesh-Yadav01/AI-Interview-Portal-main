const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailOtpHash: {
      type: String,
      default: null
    },
    emailOtpExpires: {
      type: Date,
      default: null
    },
    resetPasswordOtpHash: {
      type: String,
      default: null
    },
    resetPasswordOtpExpires: {
      type: Date,
      default: null
    },
    resume: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compatibility helper methods matching previous service calls
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: String(email).trim().toLowerCase() });
};

userSchema.statics.updateById = function (id, updates) {
  return this.findByIdAndUpdate(id, { $set: updates }, { new: true });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
