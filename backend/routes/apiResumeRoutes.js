const path = require("path");
const express = require("express");
const multer = require("multer");
const apiResumeController = require("../controllers/apiResumeController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are supported."));
    }
  }
});

router.post("/analyze", requireAuth, upload.single("resume"), apiResumeController.analyze);
router.get("/my-resume", requireAuth, apiResumeController.getMyResume);

module.exports = router;

