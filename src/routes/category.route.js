const express = require("express");
const CategoryController = require("../controllers/category.controller");

const category = express.Router();

category.post("/admin/category", CategoryController.create);
category.get("/admin/category/:id", CategoryController.getOne);
category.put("/admin/category/:slug", CategoryController.update);
category.delete("/admin/category/:id", CategoryController.softDelete);
category.delete("/admin/category/destroy/:id", CategoryController.delete);
category.get("/category/tree", CategoryController.getTree);
category.get("/category/:slug", CategoryController.getBySlug);
category.get("/category", CategoryController.getAll);

module.exports = category;
