const express = require("express");
const apiInterviewController = require("../controllers/apiInterviewController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/categories", apiInterviewController.getCategories);
router.get("/status", requireAuth, apiInterviewController.getStatus);
router.post("/start", requireAuth, apiInterviewController.start);
router.post("/submit", requireAuth, apiInterviewController.submit);
router.post("/terminate", requireAuth, apiInterviewController.terminate);
router.get("/result/:id", requireAuth, apiInterviewController.getResult);
router.get("/result/:id/report", requireAuth, apiInterviewController.downloadReport);

module.exports = router;

