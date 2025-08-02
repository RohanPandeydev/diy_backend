"use strict";
const expressAsyncHandler = require("express-async-handler");
const db = require("../models/index.js");
const { serverErrorResponse, successResponse, badRequestResponse } = require("../utils/response.js");
const { Op } = require("sequelize");

const FormSubmissionController = {};

// Submit Design Consultant Form
FormSubmissionController.submitDesignConsultant = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { name, email, phone } = req.body;

            // Validation
            if (!name || !email) {
                return badRequestResponse(res, "Name and email  are required");
            }

            // Email validation (optional but if provided, should be valid)
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return badRequestResponse(res, "Please provide a valid email address");
            }

            const submission = await db.FormSubmission.create({
                name,
                email: email || null,
                phone,
                form_type: 'design_consultant',
                status: 'new'
            });

            return successResponse(res, {
                status: true,
                message: "Design consultant request submitted successfully",
                data: submission
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Submit Inquiry Form
FormSubmissionController.submitInquiry = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { name, email, interest_of_services, message } = req.body;

            // Validation
            if (!name || !email || !interest_of_services || !message) {
                return badRequestResponse(res, "Name, email, interest of services, and message are required");
            }

            // Email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return badRequestResponse(res, "Please provide a valid email address");
            }

            const submission = await db.FormSubmission.create({
                name,
                email,
                interest_of_services,
                message,
                form_type: 'inquiry',
                status: 'new'
            });

            return successResponse(res, {
                status: true,
                message: "Inquiry submitted successfully",
                data: submission
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Submit Contact Us Form
FormSubmissionController.submitContact = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { name, email, company, phone, subject, message } = req.body;

            // Validation
            if (!name || !email || !subject) {
                return badRequestResponse(res, "Name, email, subject, are required");
            }

            // Email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return badRequestResponse(res, "Please provide a valid email address");
            }

            const submission = await db.FormSubmission.create({
                name,
                email,
                company: company || null,
                phone: phone || null,
                subject,
                message,
                form_type: 'contact',
                status: 'new'
            });

            return successResponse(res, {
                status: true,
                message: "Contact form submitted successfully",
                data: submission
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Get All Form Submissions (Admin)
FormSubmissionController.getAll = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { query } = req;
            const page = parseInt(query?.page) || 1;
            const limit = parseInt(query?.limit) || 10;
            const offset = (page - 1) * limit;

            const where = {
                is_deleted: false,
            };

            // Filter by form type
            if (query?.form_type) {
                where.form_type = query.form_type;
            }

            // Filter by status
            if (query?.status) {
                where.status = query.status;
            }

            // Search by name or email
            if (query?.search) {
                where[Op.or] = [
                    { name: { [Op.substring]: query.search } },
                    { email: { [Op.substring]: query.search } },
                ];
            }

            // Order
            let order = [["createdAt", "DESC"]];
            if (query?.order) {
                const [field, direction] = query.order.split(".");
                if (field && direction && ["ASC", "DESC"].includes(direction.toUpperCase())) {
                    order = [[field, direction.toUpperCase()]];
                }
            }

            const total = await db.FormSubmission.count({ where });
            const page_count = Math.ceil(total / limit);
            const pagination = { page, limit, page_count, total };

            const submissions = await db.FormSubmission.findAll({
                where,
                attributes: { exclude: ["deletedAt"] },
                limit,
                offset,
                order,
            });

            return successResponse(res, {
                status: true,
                data: submissions,
                pagination,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Get Form Submission by ID (Admin)
FormSubmissionController.getOne = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const submission = await db.FormSubmission.findOne({
                where: { id, is_deleted: false },
            });

            if (!submission) {
                return badRequestResponse(res, "Form submission not found");
            }

            return successResponse(res, {
                status: true,
                data: submission,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Update Form Submission Status (Admin)
FormSubmissionController.updateStatus = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const { status, admin_notes } = req.body;

            const submission = await db.FormSubmission.findOne({
                where: { id, is_deleted: false },
            });

            if (!submission) {
                return badRequestResponse(res, "Form submission not found");
            }

            // Validate status
            const validStatuses = ['new', 'in_progress', 'completed', 'rejected'];
            if (status && !validStatuses.includes(status)) {
                return badRequestResponse(res, "Invalid status value");
            }

            await submission.update({
                status: status || submission.status,
                admin_notes: admin_notes || submission.admin_notes,
            });

            return successResponse(res, {
                status: true,
                message: "Form submission updated successfully",
                data: submission,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Soft Delete Form Submission (Admin)
FormSubmissionController.softDelete = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const submission = await db.FormSubmission.findOne({
                where: { id, is_deleted: false },
            });

            if (!submission) {
                return badRequestResponse(res, "Form submission not found");
            }

            await submission.update({ is_deleted: true });

            return successResponse(res, {
                status: true,
                message: "Form submission deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Hard Delete Form Submission (Admin)
FormSubmissionController.delete = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const submission = await db.FormSubmission.findByPk(id);

            if (!submission) {
                return badRequestResponse(res, "Form submission not found");
            }

            await submission.destroy({ force: true });

            return successResponse(res, {
                status: true,
                message: "Form submission permanently deleted",
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Get Form Statistics (Admin)
FormSubmissionController.getStatistics = [
    expressAsyncHandler(async (req, res) => {
        try {
            const totalSubmissions = await db.FormSubmission.count({
                where: { is_deleted: false }
            });

            const submissionsByType = await db.FormSubmission.findAll({
                where: { is_deleted: false },
                attributes: [
                    'form_type',
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
                ],
                group: ['form_type']
            });

            const submissionsByStatus = await db.FormSubmission.findAll({
                where: { is_deleted: false },
                attributes: [
                    'status',
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
                ],
                group: ['status']
            });

            const recentSubmissions = await db.FormSubmission.findAll({
                where: { is_deleted: false },
                order: [['createdAt', 'DESC']],
                limit: 5,
                attributes: ['id', 'name', 'email', 'form_type', 'status', 'createdAt']
            });

            return successResponse(res, {
                status: true,
                data: {
                    total: totalSubmissions,
                    byType: submissionsByType,
                    byStatus: submissionsByStatus,
                    recent: recentSubmissions
                }
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

module.exports = FormSubmissionController; 