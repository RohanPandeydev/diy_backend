const express = require("express");
const SeoContentController = require("../controllers/seo_content");

const seoContentRoutes = express.Router();

// Create SEO content
seoContentRoutes.post("/seo", SeoContentController.create);

// Get SEO content by slug
seoContentRoutes.get("/seo", SeoContentController.get);

// Get all SEO content
seoContentRoutes.get("/seo", SeoContentController.get);

// Update SEO content by slug
seoContentRoutes.put("/seo/:slug", SeoContentController.update);

// Delete SEO content by slug
seoContentRoutes.delete("/seo/:slug", SeoContentController.delete);

module.exports = seoContentRoutes;
