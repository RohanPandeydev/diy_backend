"use strict";
const express = require("express");
const router = express.Router();
const FormSubmissionController = require("../controllers/form_submission.controller.js");
const verifyToken = require("../middleware/auth.middleware.js");

// Public routes for form submissions
router.post("/design-consultant", FormSubmissionController.submitDesignConsultant);
router.post("/inquiry", FormSubmissionController.submitInquiry);
router.post("/contact", FormSubmissionController.submitContact);

// Admin routes (protected)
router.get("/admin/form-data/all", verifyToken, FormSubmissionController.getAll);
router.get("/admin/form-data/statistics", verifyToken, FormSubmissionController.getStatistics);
router.get("/admin/form-data/:id", verifyToken, FormSubmissionController.getOne);
router.put("/admin/form-data/:id/status", verifyToken, FormSubmissionController.updateStatus);
router.delete("/admin/form-data/:id", verifyToken, FormSubmissionController.softDelete);
router.delete("/admin/form-data/:id/destroy", verifyToken, FormSubmissionController.delete);

module.exports = router; 