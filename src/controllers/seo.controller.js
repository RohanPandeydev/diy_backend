"use strict";
const expressAsyncHandler = require("express-async-handler");
const db = require("../models/index.js");
const {
    serverErrorResponse,
    successResponse,
    notFoundResponse,
} = require("../utils/response.js");
const verifyToken = require("../middleware/auth.middleware.js");
const upload = require("../middleware/upload.middleware.js");
const deleteFile = require("../utils/deletefile.js");
const { where, col, fn } = require("sequelize")

const SeoController = {};

// Create SEO
SeoController.create = [
    verifyToken,
    upload.single("cover_image"),
    expressAsyncHandler(async (req, res) => {
        try {
            const { title, slug, category_id } = req.body;
            const author_id = req.user.id;
            const obj = { ...req.body };

            if (!(title && slug && category_id)) {
                return successResponse(res, {
                    status: false,
                    message: "Please fill all required fields",
                });
            }

            const findAuthor = await db.user.findByPk(author_id);
            if (!findAuthor) {
                return successResponse(res, {
                    status: false,
                    message: "Author not found",
                });
            }

            const findCategory = await db.category.findByPk(category_id);
            if (!findCategory) {
                return successResponse(res, {
                    status: false,
                    message: "Category not found",
                });
            }

            const seoExists = await db.seo.findOne({
                where: { slug },
            });
            if (seoExists) {
                return successResponse(res, {
                    status: false,
                    message: "Slug already exists",
                });
            }

            if (req.file) {
                obj.cover_image = req.file.path;
            }

            obj.author_id = author_id;

            const seo = await db.seo.create(obj);

            return successResponse(res, {
                status: true,
                message: "SEO entry created successfully",
                data: seo,
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Get All SEO Entries
SeoController.getAll = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const seoEntries = await db.seo.findAll({
                where: {},
                include: [
                    { model: db.user, as: "author", },
                    { model: db.category, as: "category", attributes: ["id", "name", "slug"] },
                ],
            });

            return successResponse(res, {
                status: true,
                data: seoEntries,
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Get SEO by Slug
SeoController.getBySlug = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { slug } = req.params;
            const seo = await db.seo.findOne({
                where: { slug },
                include: [
                    { model: db.user, as: "author" },
                    { model: db.category, as: "category" },
                ],
            });

            if (!seo) return notFoundResponse(res, "SEO entry not found");

            return successResponse(res, {
                status: true,
                data: seo,
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];
// Get SEO entries by case-insensitive category.name


SeoController.getByCategoryName = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { name } = req.params;

            const seoEntries = await db.seo.findOne({
                include: [
                    {
                        model: db.category,
                        as: "category",
                        where: where(fn("LOWER", col("category.name")), name.toLowerCase()),
                    },
                    {
                        model: db.user,
                        as: "author",
                    },
                ],
            });

            if (!seoEntries) {
                return notFoundResponse(res, "No SEO entries found for this category.");
            }

            return successResponse(res, {
                status: true,
                data: seoEntries,
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];
// Update SEO by Slug
SeoController.update = [
    verifyToken,
    upload.single("cover_image"),
    expressAsyncHandler(async (req, res) => {
        try {
            const { slug } = req.params;
            const obj = { ...req.body };

            const seo = await db.seo.findOne({ where: { slug } });
            if (!seo) return notFoundResponse(res, "SEO entry not found");

            if (req.body.slug && req.body.slug !== slug) {
                const existing = await db.seo.findOne({ where: { slug: req.body.slug } });
                if (existing) {
                    return successResponse(res, {
                        status: false,
                        message: "Slug already exists",
                    });
                }
            }

            if (req.file) {
                obj.cover_image = req.file.path;
                if (seo.cover_image) deleteFile(seo.cover_image);
            }

            await seo.update(obj);

            return successResponse(res, {
                status: true,
                message: "SEO entry updated successfully",
                data: seo,
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Delete SEO
SeoController.delete = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { slug } = req.params;
            const seo = await db.seo.findOne({ where: { slug } });

            if (!seo) return notFoundResponse(res, "SEO entry not found");

            if (seo.cover_image) deleteFile(seo.cover_image);
            await db.seo.destroy({ where: { slug } });

            return successResponse(res, {
                status: true,
                message: "SEO entry deleted successfully",
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

module.exports = SeoController;
