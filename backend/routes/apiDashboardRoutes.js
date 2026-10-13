const express = require("express");
const apiDashboardController = require("../controllers/apiDashboardController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", requireAuth, apiDashboardController.getStats);

module.exports = router;

