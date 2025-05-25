const express = require("express");
const SeoController = require("../controllers/seo.controller");

const seo = express.Router();

seo.post("/admin/seo", SeoController.create);
seo.put("/admin/seo/:slug", SeoController.update);
seo.delete("/admin/seo/:slug", SeoController.delete);
seo.get("/seo/:slug", SeoController.getBySlug);
seo.get("/seo/category/:name", SeoController.getByCategoryName);
seo.get("/seo", SeoController.getAll);

module.exports = seo;
