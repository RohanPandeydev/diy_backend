const expressAsyncHandler = require("express-async-handler");
const {
  serverErrorResponse,
  successResponse,
  forbiddenResponse,
} = require("../utils/response");

const db = require("../models/index");

const SeoContentController = {};

// Create SEO Content
SeoContentController.create = [
  expressAsyncHandler(async (req, res) => {
    try {
      const { page_slug, meta_title, meta_description, meta_keywords, og_title, og_description, og_image_url } = req.body;

      if (!page_slug) {
        return forbiddenResponse(res, {
          message: "Page slug is required",
        });
      }

      const seoContent = await db.SeoContent.create({
        page_slug,
        meta_title,
        meta_description,
        meta_keywords,
        og_title,
        og_description,
        og_image_url,
      });

      return successResponse(res, {
        seoContent,
        status: true,
        message: "SEO content created successfully",
      });
    } catch (error) {
      console.log(error);
      return serverErrorResponse(res, error);
    }
  }),
];

// Update SEO Content
SeoContentController.update = [
  expressAsyncHandler(async (req, res) => {
    const { slug } = req.params;
    try {
      const seoContent = await db.SeoContent.findOne({ where: { page_slug: slug } });

      if (!seoContent) {
        return forbiddenResponse(res, {
          message: "SEO content not found for this page",
        });
      }

      await seoContent.update(req.body);

      return successResponse(res, {
        seoContent,
        message: "SEO content updated successfully",
        status: true,
      });
    } catch (error) {
      console.log(error);
      return serverErrorResponse(res, error);
    }
  }),
];

// Get SEO Content
SeoContentController.get = [
  expressAsyncHandler(async (req, res) => {
    const { slug, is_deleted } = req.query;
    try {
      const filter = {};

      if (slug) {
        filter.page_slug = slug;
      }

      if (is_deleted !== undefined) {
        if (is_deleted === "true" || is_deleted === "1") {
          filter.is_deleted = true; // Soft deleted items
        } else if (is_deleted === "false" || is_deleted === "0") {
          filter.is_deleted = false; // Not deleted
        }
      }


      const seoContents = await db.SeoContent.findAll({
        where: filter,
        paranoid: false, // IMPORTANT: if you want to fetch deleted records too
      });

      return successResponse(res, {
        seoContents,
        message: seoContents.length
          ? "SEO content fetched successfully"
          : "No SEO content found",
      });
    } catch (error) {
      console.error(error);
      return serverErrorResponse(res, error);
    }
  }),
];

// Delete SEO Content
SeoContentController.delete = [
  expressAsyncHandler(async (req, res) => {
    const { slug } = req.params;
    try {
      if (!slug) {
        return forbiddenResponse(res, {
          message: "Slug is required for deletion",
        });
      }

      const seoContent = await db.SeoContent.findOne({ where: { page_slug: slug } });

      if (!seoContent) {
        return forbiddenResponse(res, {
          message: "SEO content not found for this page",
        });
      }

      await seoContent.update({ is_deleted: req.body.is_deleted });

      return successResponse(res, {
        message: req.body.is_deleted ? "SEO content deactivated successfully" : "SEO content activated successfully",
        status: !!seoContent,
      });
    } catch (error) {
      console.log(error);
      return serverErrorResponse(res, error);
    }
  }),
];

module.exports = SeoContentController;
