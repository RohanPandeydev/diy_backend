"use strict";
const express = require("express");
const router = express.Router();
const FormSubmissionController = require("../controllers/form_submission.controller.js");
const verifyToken = require("../middleware/auth.middleware.js");


const rateLimit = require("express-rate-limit");

// Strict rate limiter for form submissions to prevent spam
const formSubmissionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 form submissions per hour
    message: {
        error: "Too many form submissions from this IP. Please try again later.",
        retryAfter: "1 hour",
        code: "FORM_RATE_LIMIT_EXCEEDED"
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests from counting against the limit
    skipSuccessfulRequests: false,
    // Skip failed requests from counting against the limit
    skipFailedRequests: true,
});

// Even stricter rate limiter for contact forms (most likely to be spammed)
const contactFormLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 contact form submissions per hour
    message: {
        error: "Too many contact form submissions from this IP. Please try again later.",
        retryAfter: "1 hour",
        code: "CONTACT_RATE_LIMIT_EXCEEDED"
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: true,
});

// Public routes for form submissions with rate limiting
router.post("/design-consultant", formSubmissionLimiter, FormSubmissionController.submitDesignConsultant);
router.post("/inquiry", formSubmissionLimiter, FormSubmissionController.submitInquiry);
router.post("/contact", contactFormLimiter, FormSubmissionController.submitContact);

// Admin routes (protected)
router.get("/admin/form-data/all", verifyToken, FormSubmissionController.getAll);
router.get("/admin/form-data/statistics", verifyToken, FormSubmissionController.getStatistics);
router.get("/admin/form-data/:id", verifyToken, FormSubmissionController.getOne);
router.put("/admin/form-data/:id/status", verifyToken, FormSubmissionController.updateStatus);
router.delete("/admin/form-data/:id", verifyToken, FormSubmissionController.softDelete);
router.delete("/admin/form-data/:id/destroy", verifyToken, FormSubmissionController.delete);

module.exports = router; 