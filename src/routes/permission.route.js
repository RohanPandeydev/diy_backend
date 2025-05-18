const express = require("express");
const PermissionModuleController = require("../controllers/permission.controller");

const permission = express.Router();

// Create Permission Module
permission.post("/admin/permission", PermissionModuleController.create);

// Get All Permission Modules (list)
permission.get("/admin/permissions", PermissionModuleController.getAll);

// Get Permission Module by ID
permission.get("/admin/permission/:id", PermissionModuleController.getOne);

// Update Permission Module by ID
permission.put("/admin/permission/:id", PermissionModuleController.update);

// Soft Delete Permission Module by ID
permission.delete("/admin/permission/:id", PermissionModuleController.softDelete);


module.exports = permission;
