const express = require("express");
const rateLimit = require("express-rate-limit");
const apiAuthController = require("../controllers/apiAuthController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again after 15 minutes." }
});

router.post("/register", authLimiter, apiAuthController.register);
router.post("/verify-otp", authLimiter, apiAuthController.verifyOtp);
router.post("/resend-otp", authLimiter, apiAuthController.resendOtp);
router.post("/login", authLimiter, apiAuthController.login);
router.post("/forgot-password", authLimiter, apiAuthController.forgotPassword);
router.post("/reset-password", authLimiter, apiAuthController.resetPassword);
router.get("/me", requireAuth, apiAuthController.getMe);
router.post("/logout", apiAuthController.logout);

module.exports = router;

