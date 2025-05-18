"use strict";
const expressAsyncHandler = require("express-async-handler");
const db = require("../models/index.js");
const {
    serverErrorResponse,
    successResponse,
    notFoundResponse,
} = require("../utils/response.js");
const verifyToken = require("../middleware/auth.middleware.js");
const { Op } = require("sequelize");

const PermissionController = {};

// ➤ Create Permission
PermissionController.create = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { action, module_id } = req.body;

            if (!action || !module_id) {
                return successResponse(res, {
                    status: false,
                    message: "Action and module_id are required",
                });
            }

            // Check if module exists and not deleted
            const moduleExists = await db.permissionmodule.findOne({
                where: { id: module_id, is_deleted: false },
            });
            if (!moduleExists) {
                return successResponse(res, {
                    status: false,
                    message: "Permission module not found",
                });
            }

            // Check if permission action already exists for this module
            const exists = await db.permission.findOne({
                where: { action, module_id, is_deleted: false },
            });
            if (exists) {
                return successResponse(res, {
                    status: false,
                    message: "Permission action already exists for this module",
                });
            }

            const permission = await db.permission.create({ action, module_id });

            return successResponse(res, {
                status: true,
                message: "Permission created successfully",
                data: permission,
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// ➤ Get All Permissions
PermissionController.getAll = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { search, page = 1, limit = 10, order } = req.query;
            const offset = (page - 1) * limit;

            const where = { is_deleted: false };

            if (search) {
                where.action = { [Op.substring]: search };
            }

            const total = await db.permission.count({ where });
            const page_count = Math.ceil(total / limit);

            let orderBy = [["createdAt", "ASC"]];
            if (order) {
                const [field, direction] = order.split(".");
                if (field && direction && ["ASC", "DESC"].includes(direction.toUpperCase())) {
                    orderBy = [[field, direction.toUpperCase()]];
                }
            }

            const permissions = await db.permission.findAll({
                where,
                offset,
                limit: parseInt(limit),
                order: orderBy,
                attributes: { exclude: ["deletedAt"] },
                include: [{
                    model: db.permissionmodule,
                    as: "module",
                    attributes: ["id", "name"],
                }],
            });

            return successResponse(res, {
                status: true,
                data: permissions,
                pagination: { page: parseInt(page), limit: parseInt(limit), page_count, total },
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// ➤ Get Single Permission by ID
PermissionController.getOne = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const permission = await db.permission.findOne({
                where: { id, is_deleted: false },
                include: [{
                    model: db.permissionmodule,
                    as: "module",
                    attributes: ["id", "name"],
                }],
            });

            if (!permission) {
                return successResponse(res, {
                    status: false,
                    message: "Permission not found",
                });
            }

            return successResponse(res, {
                status: true,
                data: permission,
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// ➤ Update Permission
PermissionController.update = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const { action, module_id } = req.body;

            if (!action || !module_id) {
                return successResponse(res, {
                    status: false,
                    message: "Action and module_id are required",
                });
            }

            const permission = await db.permission.findOne({ where: { id, is_deleted: false } });

            if (!permission) {
                return successResponse(res, {
                    status: false,
                    message: "Permission not found",
                });
            }

            // Check if new module exists
            const moduleExists = await db.permissionmodule.findOne({
                where: { id: module_id, is_deleted: false },
            });
            if (!moduleExists) {
                return successResponse(res, {
                    status: false,
                    message: "Permission module not found",
                });
            }

            // Check for duplicate action in the same module except current permission
            const duplicate = await db.permission.findOne({
                where: {
                    id: { [Op.ne]: id },
                    action,
                    module_id,
                    is_deleted: false,
                },
            });
            if (duplicate) {
                return successResponse(res, {
                    status: false,
                    message: "Permission action already exists for this module",
                });
            }

            await permission.update({ action, module_id });

            return successResponse(res, {
                status: true,
                message: "Permission updated successfully",
                data: permission,
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// ➤ Soft Delete Permission
PermissionController.softDelete = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const permission = await db.permission.findByPk(id);

            if (!permission || permission.is_deleted) {
                return successResponse(res, {
                    status: false,
                    message: "Permission not found",
                });
            }

            await permission.update({ is_deleted: true });

            return successResponse(res, {
                status: true,
                message: "Permission soft deleted successfully",
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// ➤ Permanent Delete Permission (optional)
PermissionController.delete = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const permission = await db.permission.findByPk(id);

            if (!permission) {
                return successResponse(res, {
                    status: false,
                    message: "Permission not found",
                });
            }

            await permission.destroy();

            return successResponse(res, {
                status: true,
                message: "Permission permanently deleted",
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

module.exports = PermissionController;
