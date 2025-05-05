const express = require("express");
const AuthController = require("../controllers/auth.controller.js");

const auth = express.Router();

auth.post("/auth/admin/login", AuthController.loginAdmin);
auth.post("/auth/admin/logout", AuthController.logout);
auth.post("/auth/admin/register", AuthController.register);

module.exports = auth;
