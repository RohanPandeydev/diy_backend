"use strict";
const expressAsyncHandler = require("express-async-handler");
const db = require("../models/index.js");
const {
    serverErrorResponse,
    successResponse,
} = require("../utils/response.js");
const verifyToken = require("../middleware/auth.middleware.js");
const { Op } = require("sequelize");

const UserPermissionController = {};

// ➤ Assign Permission to User
UserPermissionController.assign = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        const { user_id, permission_id } = req.body;

        if (!user_id || !permission_id) {
            return successResponse(res, {
                status: false,
                message: "user_id and permission_id are required",
            });
        }

        const user = await db.user.findByPk(user_id);
        const permission = await db.permission.findByPk(permission_id);

        if (!user || !permission) {
            return successResponse(res, {
                status: false,
                message: "Invalid user_id or permission_id",
            });
        }

        const existing = await db.userpermission.findOne({
            where: { user_id, permission_id, is_deleted: false },
        });

        if (existing) {
            return successResponse(res, {
                status: false,
                message: "Permission already assigned to user",
            });
        }

        const userPermission = await db.userpermission.create({ user_id, permission_id });

        return successResponse(res, {
            status: true,
            message: "Permission assigned successfully",
            data: userPermission,
        });
    }),
];

// ➤ Revoke (Soft Delete) Permission from User
UserPermissionController.revoke = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        const { user_id, permission_id } = req.body;

        if (!user_id || !permission_id) {
            return successResponse(res, {
                status: false,
                message: "user_id and permission_id are required",
            });
        }

        const userPermission = await db.userpermission.findOne({
            where: { user_id, permission_id, is_deleted: false },
        });

        if (!userPermission) {
            return successResponse(res, {
                status: false,
                message: "Permission not found for the user",
            });
        }

        await userPermission.destroy();

        return successResponse(res, {
            status: true,
            message: "Permission revoked successfully",
        });
    }),
];

// ➤ Get All Permissions of a User
UserPermissionController.getUserPermissions = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        const { user_id } = req.params;

        const user = await db.user.findByPk(user_id);
        if (!user) {
            return successResponse(res, {
                status: false,
                message: "User not found",
            });
        }

        const permissions = await db.userpermission.findAll({
            where: { user_id, is_deleted: false },
            include: [{
                model: db.permission,
                as: "permission",
                attributes: ["id", "action"],
                include: [{
                    model: db.permissionmodule,
                    as: "module",
                    attributes: ["id", "name"],
                }],
            }],
        });

        return successResponse(res, {
            status: true,
            data: permissions,
        });
    }),
];

// ➤ Get All User Permissions
UserPermissionController.getAllUserPermissions = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {


        const permissions = await db.userpermission.findAll({
            include: [{
                model: db.permission,
                as: "permission",
                attributes: ["id", "action"],
                include: [{
                    model: db.permissionmodule,
                    as: "module",
                    attributes: ["id", "name"],
                }],
            }],
        });

        return successResponse(res, {
            status: true,
            data: permissions,
        });
    }),
];


UserPermissionController.checkIsUserHasPermission = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        const { moduleName, action } = req.query;
        const user_id = req.user.id;

        if (req.user.role == 1) {
            return successResponse(res, {
                status: true,
                message: "Admin access granted",
                permission: true,
            });
        }

        if (!moduleName || !action) {
            return successResponse(res, {
                status: false,
                message: "moduleName and action are required",
            });
        }

        // Step 1: Find the module
        const module = await db.permissionmodule.findOne({
            where: {
                name: moduleName,
                is_deleted: false,
            },
        });

        if (!module) {
            return successResponse(res, {
                status: false,
                message: "Module not found",

            });
        }

        // Step 2: Find the permission under the module
        const permission = await db.permission.findOne({
            where: {
                module_id: module.id,
                action,
                is_deleted: false,
            },
        });

        if (!permission) {
            return successResponse(res, {
                status: false,
                message: "action not found for this  module",
            });
        }

        // Step 3: Check if the user has this permission
        const userPermission = await db.userpermission.findOne({
            where: {
                user_id,
                permission_id: permission.id,
                is_deleted: false,
            },
        });

        if (!userPermission) {
            return successResponse(res, {
                status: false,
                message: "User does not have the requested permission",
            });
        }

        return successResponse(res, {
            status: !!userPermission,
            message: userPermission ? "Permission granted" : "Permission denied",
            permission: !!userPermission,
        });
    }),
];








UserPermissionController.checkIsUserHasPermissionSocket = async (tokendata, data) => {



    const user_id = tokendata?.id
    let parsedData;

    // Try to parse if data is stringified JSON
    try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (err) {
        console.error("Invalid JSON format:", err);
        return false
    }


    const { moduleName, action } = parsedData;

    if (!moduleName || !action) {
        return false

    }


    // Step 1: Find the module
    const module = await db.permissionmodule.findOne({
        where: {
            name: moduleName,
            is_deleted: false,
        },
    });

    if (!module) {
        return false

    }


    // Step 2: Find the permission under the module
    const permission = await db.permission.findOne({
        where: {
            module_id: module.id,
            action,
            is_deleted: false,
        },
    });

    if (!permission) {
        return false
    }

    // Step 3: Check if the user has this permission
    const userPermission = await db.userpermission.findOne({
        where: {
            user_id,
            permission_id: permission.id,
            is_deleted: false,
        },
    });



    if (!userPermission) {
        return false

    }

    return true

}






module.exports = UserPermissionController;
