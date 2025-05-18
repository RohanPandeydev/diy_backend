const express = require("express");
const PermissionModuleController = require("../controllers/permissionmodule.controller");

const permissionmodule = express.Router();

// Create Permission Module
permissionmodule.post("/admin/module", PermissionModuleController.create);

// Get All Permission Modules (list)
permissionmodule.get("/admin/modules", PermissionModuleController.getAll);

// Get Permission Module by ID
permissionmodule.get("/admin/module/:id", PermissionModuleController.getOne);

// Update Permission Module by ID
permissionmodule.put("/admin/module/:id", PermissionModuleController.update);

// Soft Delete Permission Module by ID
permissionmodule.delete("/admin/module/:id", PermissionModuleController.softDelete);


module.exports = permissionmodule;
