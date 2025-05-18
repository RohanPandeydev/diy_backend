const express = require("express");
const UserPermissionController = require("../controllers/userpermission.controller");

const userpermission = express.Router();

// Assign permission to user
userpermission.post("/admin/user-permission/assign", UserPermissionController.assign);

// Revoke permission from user
userpermission.post("/admin/user-permission/revoke", UserPermissionController.revoke);

// Get user's permissions
userpermission.get("/admin/user-permission", UserPermissionController.getAllUserPermissions);
userpermission.get("/admin/user-permission/:user_id", UserPermissionController.getUserPermissions);
userpermission.get("/admin/check-user-permission", UserPermissionController.checkIsUserHasPermission);

module.exports = userpermission;
