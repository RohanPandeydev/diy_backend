const express = require("express");
const UserController = require("../controllers/user.controller");

const user = express.Router();

user.get("/admin/user/:id", UserController.getOne);
user.put("/admin/user/:id", UserController.update);
user.delete("/admin/user/:id", UserController.softDelete);
user.delete("/admin/user/destroy/:id", UserController.delete);
user.get("/admin/users", UserController.getAll);

module.exports = user;
