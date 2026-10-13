const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpMail, sendPasswordResetOtpMail } = require("../services/emailService");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").slice(0, 80);
}

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "ai_interview_default_jwt_secret_key_32chars", {
    expiresIn: "7d"
  });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function setEmailOtp(user) {
  const otp = generateOtp();
  await User.updateById(user._id, {
    emailOtpHash: await bcrypt.hash(otp, 10),
    emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000)
  });
  const delivery = await sendOtpMail(user, otp);
  return delivery.sent ? null : otp;
}

async function setPasswordResetOtp(user) {
  const otp = generateOtp();
  await User.updateById(user._id, {
    resetPasswordOtpHash: await bcrypt.hash(otp, 10),
    resetPasswordOtpExpires: new Date(Date.now() + 10 * 60 * 1000)
  });
  const delivery = await sendPasswordResetOtpMail(user, otp);
  return delivery.sent ? null : otp;
}

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    resume: user.resume,
    createdAt: user.createdAt
  };
}

exports.register = async (req, res) => {
  const name = normalizeName(req.body.name);
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!name || !email || password.length < 8) {
    return res.status(400).json({
      error: "Enter a valid name, email, and password with at least 8 characters."
    });
  }

  try {
    let user = await User.findByEmail(email);
    if (user) {
      user = await User.updateById(user._id, {
        name: name || user.name,
        password: await bcrypt.hash(password, 12),
        isEmailVerified: false
      });
      const devOtp = await setEmailOtp(user);
      return res.json({
        success: true,
        message: "Account already exists. Verification OTP sent.",
        email,
        devOtp: devOtp || undefined
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false
    });

    const devOtp = await setEmailOtp(user);
    return res.status(201).json({
      success: true,
      message: "Account created. Verification OTP sent.",
      email,
      devOtp: devOtp || undefined
    });
  } catch (error) {
    console.error("API Register error:", error.message);
    res.status(500).json({ error: "Failed to register account: " + error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || "").trim();

  if (!email || otp.length !== 6) {
    return res.status(400).json({ error: "Enter a valid 6-digit OTP and email." });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user || !user.emailOtpHash || !user.emailOtpExpires) {
      return res.status(400).json({ error: "OTP expired or not found. Request a new one." });
    }

    if (new Date() > new Date(user.emailOtpExpires)) {
      return res.status(400).json({ error: "OTP has expired. Request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, user.emailOtpHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid OTP. Please check and try again." });
    }

    const updatedUser = await User.updateById(user._id, {
      isEmailVerified: true,
      emailOtpHash: null,
      emailOtpExpires: null
    });

    const token = createToken(updatedUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      message: "Email verified successfully.",
      token,
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error("API verifyOtp error:", error.message);
    res.status(500).json({ error: "OTP verification failed." });
  }
};

exports.resendOtp = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "No account found with this email." });
    }

    const devOtp = await setEmailOtp(user);
    res.json({
      success: true,
      message: "New OTP sent successfully.",
      devOtp: devOtp || undefined
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to resend OTP." });
  }
};

exports.login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!user.isEmailVerified) {
      const devOtp = await setEmailOtp(user);
      return res.status(403).json({
        error: "Please verify your email before signing in.",
        requiresVerification: true,
        email,
        devOtp: devOtp || undefined
      });
    }

    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("API Login error:", error.message);
    res.status(500).json({ error: "Login failed." });
  }
};

exports.forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.json({ success: true, message: "If this email is registered, a reset code was sent." });
    }

    const devOtp = await setPasswordResetOtp(user);
    res.json({
      success: true,
      message: "Password reset OTP sent.",
      email,
      devOtp: devOtp || undefined
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send reset code." });
  }
};

exports.resetPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || "").trim();
  const password = String(req.body.password || "");

  if (!email || otp.length !== 6 || password.length < 8) {
    return res.status(400).json({
      error: "Provide valid email, 6-digit OTP, and password with at least 8 characters."
    });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user || !user.resetPasswordOtpHash || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ error: "Reset OTP not found or expired." });
    }

    if (new Date() > new Date(user.resetPasswordOtpExpires)) {
      return res.status(400).json({ error: "Reset OTP has expired." });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtpHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    await User.updateById(user._id, {
      password: await bcrypt.hash(password, 12),
      resetPasswordOtpHash: null,
      resetPasswordOtpExpires: null
    });

    res.json({ success: true, message: "Password updated successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password." });
  }
};

exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.user });
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  if (req.session) {
    req.session.destroy();
  }
  res.json({ success: true, message: "Logged out successfully" });
};

