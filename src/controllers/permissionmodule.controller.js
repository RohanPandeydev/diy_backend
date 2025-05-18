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

const PermissionModuleController = {};

// ➤ Create Permission Module
PermissionModuleController.create = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { name } = req.body;

            if (!name) {
                return successResponse(res, {
                    status: false,
                    message: "Module name is required",
                });
            }

            const isExist = await db.permissionmodule.findOne({
                where: { name, is_deleted: false },
            });

            if (isExist) {
                return successResponse(res, {
                    status: false,
                    message: "Module name already exists",
                });
            }

            const moduleData = await db.permissionmodule.create({ name });

            return successResponse(res, {
                status: true,
                message: "Permission module created successfully",
                data: moduleData,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// ➤ Get All Permission Modules
PermissionModuleController.getAll = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { search, page = 1, limit = 10, order } = req.query;

            const offset = (page - 1) * limit;
            const where = { is_deleted: false };

            if (search) {
                where.name = { [Op.substring]: search };
            }

            const total = await db.permissionmodule.count({ where });
            const page_count = Math.ceil(total / limit);

            let orderBy = [["createdAt", "ASC"]];
            if (order) {
                const [field, direction] = order.split(".");
                if (field && direction && ["ASC", "DESC"].includes(direction.toUpperCase())) {
                    orderBy = [[field, direction.toUpperCase()]];
                }
            }

            const modules = await db.permissionmodule.findAll({
                where,
                offset,
                limit: parseInt(limit),
                order: orderBy,
                attributes: { exclude: ["deletedAt"] },
                include: [{
                    model: db.permission,
                    as: "permissions",
                    attributes: ["id", "action"],
                }],
            });

            return successResponse(res, {
                status: true,
                data: modules,
                pagination: { page: parseInt(page), limit: parseInt(limit), page_count, total },
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// ➤ Get Single Module by ID
PermissionModuleController.getOne = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const moduleData = await db.permissionmodule.findOne({
                where: { id, is_deleted: false },
                include: [{
                    model: db.permission,
                    as: "permissions",
                    attributes: ["id", "action"],
                }],
            });

            if (!moduleData) {
                return successResponse(res, {
                    status: false,
                    message: "Module not found",
                });
            }

            return successResponse(res, {
                status: true,
                data: moduleData,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// ➤ Update Permission Module
PermissionModuleController.update = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                return successResponse(res, {
                    status: false,
                    message: "Module name is required",
                });
            }

            const moduleData = await db.permissionmodule.findOne({ where: { id, is_deleted: false } });

            if (!moduleData) {
                return successResponse(res, {
                    status: false,
                    message: "Module not found",
                });
            }

            const isNameExist = await db.permissionmodule.findOne({
                where: {
                    id: { [Op.ne]: id },
                    name,
                    is_deleted: false,
                },
            });

            if (isNameExist) {
                return successResponse(res, {
                    status: false,
                    message: "Module name already exists",
                });
            }

            await moduleData.update({ name });

            return successResponse(res, {
                status: true,
                message: "Module updated successfully",
                data: moduleData,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// ➤ Soft Delete Permission Module
PermissionModuleController.softDelete = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const moduleData = await db.permissionmodule.findByPk(id);

            if (!moduleData || moduleData.is_deleted) {
                return successResponse(res, {
                    status: false,
                    message: "Module not found",
                });
            }

            await moduleData.update({ is_deleted: true });

            return successResponse(res, {
                status: true,
                message: "Module soft deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

module.exports = PermissionModuleController;
