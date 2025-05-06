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
const { Op } = require("sequelize");
const deleteFile = require("../utils/deletefile.js");
const moment = require("moment");

const BlogController = {};

// Create Blog
BlogController.create = [
    verifyToken,
    upload.single("cover_image"),
    expressAsyncHandler(async (req, res) => {
        try {
            const { title, content, slug, is_published, category_id } = req.body;
            const author_id = req.user.id;
            const obj = { ...req.body };

            if (!(title && content && slug && category_id)) {
                return successResponse(res, {
                    status: false,
                    message: "Please fill all required fields",
                });
            }

            const findAuthor = await db.user.findByPk(author_id);
            if (!findAuthor) {
                return successResponse(res, {
                    status: false,
                    message: "Sorry, this account does not exist",
                });
            }

            const findCategory = await db.category.findByPk(category_id);
            if (!findCategory) {
                return successResponse(res, {
                    status: false,
                    message: "Sorry, this category does not exist",
                });
            }

            const blogRecord = await db.blog.findOne({
                where: { slug, is_deleted: false },
            });
            if (blogRecord) {
                return successResponse(res, {
                    status: false,
                    message: "Sorry, slug already exists",
                });
            }

            if (req.file) {
                obj.cover_image = req.file.path;
            }

            const isPublishedBool = is_published === "true" || is_published === true;
            if (isPublishedBool) {
                obj.published_at = moment().format("YYYY-MM-DD HH:mm:ss");
            }
            obj.is_published = isPublishedBool;

            const blog = await db.blog.create({
                author_id,
                ...obj,
            });

            return successResponse(res, {
                status: true,
                message: "Blog created successfully",
                data: blog,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Get All Blogs
BlogController.getAll = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { query } = req;
            const page = parseInt(query?.page) || 1;
            const limit = parseInt(query?.limit) || 10;
            const offset = (page - 1) * limit;

            const where = { is_deleted: false };
            if (query?.filter && query?.search) {
                switch (query.filter) {
                    case "title":
                        where.title = { [Op.substring]: query.search };
                        break;
                    case "slug":
                        where.slug = { [Op.substring]: query.search };
                        break;
                }
            }

            let order = [["createdAt", "ASC"]];
            if (query?.order) {
                const [field, direction] = query.order.split(".");
                if (field && direction && ["ASC", "DESC"].includes(direction.toUpperCase())) {
                    order = [[field, direction.toUpperCase()]];
                }
            }

            const total = await db.blog.count({ where });
            const page_count = Math.ceil(total / limit);
            const pagination = { page, limit, page_count, total };

            const blogs = await db.blog.findAll({
                where,
                attributes: { exclude: ["deletedAt"] },
                limit,
                offset,
                order,
                include: [{
                    model: db.category,
                    as: "category",
                    attributes: ["id", "name", "slug", "parent_id"],
                    include: [
                        {
                          model: db.category,
                          as: "parent", // Self-referential include
                          attributes: ["id", "name", "slug"], // Attributes of parent category
                        }
                      ]
                }],
            });

            return successResponse(res, {
                status: true,
                data: blogs,
                pagination,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Get Blog by ID
BlogController.getOne = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const blog = await db.blog.findOne({
                where: { id, is_deleted: false },
                include: [{
                    model: db.category,
                    as: "category",
                    attributes: ["id", "name", "slug", "parent_id"],
                    include: [
                        {
                          model: db.category,
                          as: "parent", // Self-referential include
                          attributes: ["id", "name", "slug"], // Attributes of parent category
                        }
                      ]
                }],
            });

            if (!blog) {
                return notFoundResponse(res, "Blog not found");
            }

            return successResponse(res, {
                status: true,
                data: blog,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Get Blog by Slug
BlogController.getBySlug = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { slug } = req.params;

            const blog = await db.blog.findOne({
                where: { slug, is_deleted: false },
                include: [{
                    model: db.category,
                    as: "category",
                    attributes: ["id", "name", "slug", "parent_id"],
                    include: [
                        {
                            model: db.category,
                            as: "parent", // Self-referential include
                            attributes: ["id", "name", "slug"], // Attributes of parent category
                        }
                    ]
                }],
            });

            if (!blog) {
                return notFoundResponse(res, "Blog not found");
            }

            return successResponse(res, {
                status: true,
                data: blog,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Update Blog
BlogController.update = [
    verifyToken,
    upload.single("cover_image"),
    expressAsyncHandler(async (req, res) => {
        try {
            const { slug } = req.params;
            const obj = { ...req.body };

            if (!slug) {
                return notFoundResponse(res, "Slug not found");
            }

            const blog = await db.blog.findOne({ where: { slug } });

            if (!blog || blog.is_deleted) {
                return notFoundResponse(res, "Blog not found");
            }

            if (req.body?.slug) {
                const isSlugExist = await db.blog.findOne({
                    where: {
                        [Op.and]: [
                            { id: { [Op.ne]: blog.id } },
                            { slug: req.body.slug },
                            { is_deleted: false },
                        ],
                    },
                });

                if (isSlugExist) {
                    return successResponse(res, {
                        status: false,
                        message: "Sorry, slug already exists",
                    });
                }
            }

            if (req.file) {
                obj.cover_image = req.file.path;
                deleteFile(blog.cover_image);
            }

            const isPublishedBool = obj.is_published === "true" || obj.is_published === true;
            obj.is_published = isPublishedBool;

            if (isPublishedBool && !blog.is_published) {
                obj.published_at = moment().format("YYYY-MM-DD HH:mm:ss");
            }

            await blog.update({ ...obj });

            return successResponse(res, {
                status: true,
                message: "Blog updated successfully",
                data: blog,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Hard Delete Blog
BlogController.delete = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const blog = await db.blog.findByPk(id);

            if (!blog || blog.is_deleted) {
                return notFoundResponse(res, "Blog not found");
            }

            if (blog.cover_image) {
                deleteFile(blog.cover_image);
            }

            await db.blog.destroy({ where: { id } });

            return successResponse(res, {
                status: true,
                message: "Blog deleted successfully",
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Soft Delete Blog
BlogController.softDelete = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const blog = await db.blog.findByPk(id);

            if (!blog || blog.is_deleted) {
                return notFoundResponse(res, "Blog not found");
            }

            if (blog.is_published) {
                return successResponse(res, {
                    status: false,
                    message: "Please unpublish the blog before deleting it.",
                });
            }

            if (blog.cover_image) {
                deleteFile(blog.cover_image);
            }

            await blog.update({ is_deleted: true, slug: "" });

            return successResponse(res, {
                status: true,
                message: "Blog soft deleted successfully.",
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

module.exports = BlogController;
