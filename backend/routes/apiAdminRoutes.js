const express = require("express");
const apiAdminController = require("../controllers/apiAdminController");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/login", apiAdminController.login);
router.get("/stats", requireAdmin, apiAdminController.getStats);
router.get("/result/:id", requireAdmin, apiAdminController.getResult);
router.delete("/result/:id", requireAdmin, apiAdminController.deleteResult);
router.post("/result/:id/mail", requireAdmin, apiAdminController.mailCandidate);

module.exports = router;

