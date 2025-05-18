"use strict";
const expressAsyncHandler = require("express-async-handler");
const db = require("../models/index.js");
const { serverErrorResponse, successResponse } = require("../utils/response.js");
const verifyToken = require("../middleware/auth.middleware.js");
const upload = require("../middleware/upload.middleware.js");
const { Op } = require("sequelize");
const deleteFile = require("../utils/deletefile.js");

const UserController = {};

// Get All Users
UserController.getAll = [
    expressAsyncHandler(async (req, res) => {
        try {
            const { query } = req;
            const page = parseInt(query?.page) || 1;
            const limit = parseInt(query?.limit) || 10;
            const offset = (page - 1) * limit;

            const where = {
                is_deleted: false,
            };

            // General Search (first_name OR last_name OR email)
            if (query?.search) {
                where[Op.or] = [
                    { first_name: { [Op.substring]: query.search } },
                    { last_name: { [Op.substring]: query.search } },
                    { email: { [Op.substring]: query.search } },
                ];
            }

            // Filter: role
            if (query?.role !== undefined) {
                where.role = query.role;
            }

            // Filter: is_active
            if (query?.is_active !== undefined) {
                where.is_active = query.is_active === 'true';
            }
            // Filter: reporting_to (manager id)
            if (query?.reporting_to !== undefined) {
                where.reporting_to = query.reporting_to;
            }

            // Order
            let order = [["createdAt", "ASC"]];
            if (query?.order) {
                const [field, direction] = query.order.split(".");
                if (field && direction && ["ASC", "DESC"].includes(direction.toUpperCase())) {
                    order = [[field, direction.toUpperCase()]];
                }
            }

            const total = await db.user.count({ where });
            const page_count = Math.ceil(total / limit);
            const pagination = { page, limit, page_count, total };

            const users = await db.user.findAll({
                where,
                attributes: { exclude: ["deletedAt"] },
                limit,
                offset,
                order,
                include: [{
                    model: db.user,
                    as: "reporting",
                    attributes: ["id", "first_name", "last_name", "email"],
                }],
            });

            return successResponse(res, {
                status: true,
                data: users,
                pagination,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Get User by ID
UserController.getOne = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const user = await db.user.findOne({
                where: { id, is_deleted: false },
                include: [{
                    model: db.user,
                    as: "reporting",
                    attributes: ["id", "first_name", "last_name", "email"],
                }],
            });

            if (!user) {
                return successResponse(res, {
                    status: false,
                    message: "User not found",
                });
            }

            return successResponse(res, {
                status: true,
                data: user,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Update User
UserController.update = [
    verifyToken,
    upload.single("profile_img"),
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const obj = { ...req.body };

            const user = await db.user.findOne({ where: { id, is_deleted: false } });

            if (!user) {
                return successResponse(res, {
                    status: false,
                    message: "User not found",
                });
            }

            // Email uniqueness check (if email is updated)
            if (req.body?.email) {
                const isEmailExist = await db.user.findOne({
                    where: {
                        [Op.and]: [
                            { id: { [Op.ne]: user.id } },
                            { email: req.body.email },
                            { is_deleted: false },
                        ],
                    },
                });

                if (isEmailExist) {
                    return successResponse(res, {
                        status: false,
                        message: "Sorry, email already exists",
                    });
                }
            }
console.log(req.file,"req")

            // Update profile image
            if (req.file) {
                obj.profile_img = req.file.path;
                if (isEmailExist?.profile_img) {

                    deleteFile(user.profile_img);
                }
            }

            obj.is_active = obj.is_active === "true" || obj.is_active === true;

            await user.update({ ...obj });

            return successResponse(res, {
                status: true,
                message: "User updated successfully",
                data: user,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Hard Delete User
UserController.delete = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const user = await db.user.findByPk(id);

            if (!user || user.is_deleted) {
                return successResponse(res, {
                    status: false,
                    message: "User not found",
                });
            }

            if (user.profile_img) {
                deleteFile(user.profile_img);
            }

            await db.user.destroy({ where: { id } });

            return successResponse(res, {
                status: true,
                message: "User deleted successfully",
            });
        } catch (error) {
            console.log(error.message);
            return serverErrorResponse(res, error);
        }
    }),
];

// Soft Delete User
UserController.softDelete = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const user = await db.user.findByPk(id);

            if (!user || user.is_deleted) {
                return successResponse(res, {
                    status: false,
                    message: "User not found",
                });
            }

            if (user.profile_img) {
                deleteFile(user.profile_img);
            }

            await user.update({ is_deleted: true, email: "" });

            return successResponse(res, {
                status: true,
                message: "User soft deleted successfully.",
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

module.exports = UserController;
