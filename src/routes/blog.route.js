const express = require("express");
const BlogController = require("../controllers/blog.controller");

const blog = express.Router();

blog.post("/admin/blog", BlogController.create);
blog.get("/admin/blog/:id", BlogController.getOne);
blog.put("/admin/blog/:slug", BlogController.update);
blog.delete("/admin/blog/:id", BlogController.softDelete);
blog.delete("/admin/blog/destroy/:id", BlogController.delete);
blog.get("/blog/:slug", BlogController.getBySlug);
blog.get("/blogs", BlogController.getAll);

module.exports = blog;
