"use strict";
const expressAsyncHandler = require("express-async-handler");
const db = require("../models/index.js");
const {
    serverErrorResponse,
    successResponse,
    notFoundResponse,
} = require("../utils/response.js");
const verifyToken = require("../middleware/auth.middleware.js");
const { Op } = require("sequelize");

const CategoryController = {};

CategoryController.create = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { name, slug, parent_id } = req.body;

            // Basic validation
            if (!name) {
                return successResponse(res, {
                    status: false,
                    message: "Please provide  name",
                });
            }

            if (req.body?.slug) {

                // Check if slug already exists
                const existing = await db.category.findOne({
                    where: { slug },
                });

                if (existing) {
                    return successResponse(res, {
                        status: false,
                        message: "Slug already exists",
                    });
                }
            }

            // If parent_id is provided, check if that category exists
            if (parent_id) {
                const parentExists = await db.category.findByPk(parent_id);
                if (!parentExists) {
                    return successResponse(res, {
                        status: false,
                        message: "Parent category not found",
                    });
                }
            }

            // Handle image if present (optional)
            const obj = { name, slug, parent_id: parent_id || null };

            const category = await db.category.create(obj);

            return successResponse(res, {
                status: true,
                message: "Category created successfully",
                data: category,
            });

        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Get All Category
CategoryController.getAll = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { query } = req;

            const page = parseInt(query?.page) || 1;
            const limit = parseInt(query?.limit) || 10;
            const offset = (page - 1) * limit;

            const where = { deletedAt: null };

            if (query?.filter && query?.search) {
                switch (query.filter) {
                    case "name":
                        where.name = { [Op.substring]: query.search };
                        break;
                    case "slug":
                        where.slug = { [Op.substring]: query.search };
                        break;
                }
            }

            if (query?.parent_null === "true") {
                where.parent_id = null;
            }

            let order = [["createdAt", "ASC"]];
            if (query?.order) {
                const [field, direction] = query.order.split(".");
                if (field && direction && ["ASC", "DESC"].includes(direction.toUpperCase())) {
                    order = [[field, direction.toUpperCase()]];
                }
            }

            const include = [
                {
                    model: db.category,
                    as: "parent",
                    attributes: ["id", "name", "slug"],
                    required: !!query.parent_slug,
                    where: query.parent_slug ? { slug: query.parent_slug } : undefined,
                },
            ];

            const total = await db.category.count({ where, include });
            const page_count = Math.ceil(total / limit);
            const pagination = { page, limit, page_count, total };

            const categories = await db.category.findAll({
                where,
                attributes: { exclude: ["deletedAt"] },
                include,
                limit,
                offset,
                order,
            });

            // For each result, get its slug, find categories where their parent.slug === this.slug
            const enrichedCategories = await Promise.all(
                categories.map(async (cat) => {
                    const catData = cat.toJSON();
                    const children = await db.category.findAll({
                        where: {
                            deletedAt: null,
                        },
                        include: [
                            {
                                model: db.category,
                                as: "parent",
                                attributes: [],
                                where: { slug: catData.slug },
                            },
                        ],
                        attributes: { exclude: ["deletedAt"] },
                    });

                    return { ...catData, child: children };
                })
            );

            return successResponse(res, {
                status: true,
                data: enrichedCategories,
                pagination,
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];



// Get Category by ID
CategoryController.getOne = [
    verifyToken,

    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const category = await db.category.findOne({
                where: { id },
                attributes: { exclude: ["deletedAt"] },
                include: [
                    {
                        model: db.category,
                        as: "parent",
                        attributes: ["id", "name", "slug"]
                    }
                ]
            });

            if (!category) {
                return notFoundResponse(res, "Category not found");
            }

            return successResponse(res, {
                status: true,
                data: category,
            });

        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];
// Get Category by slug
CategoryController.getBySlug = [
    verifyToken,

    expressAsyncHandler(async (req, res) => {
        try {
            const { slug } = req.params;

            const category = await db.category.findOne({
                where: { slug, is_deleted: false }, include: [
                    {
                        model: db.category,
                        as: "parent",
                        attributes: ["id", "name", "slug"]
                    }
                ]
            });

            if (!category) {
                return notFoundResponse(res, "Category not found");
            }

            return successResponse(res, {
                status: true,
                data: category,
            });
        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

// Update Category
CategoryController.update = [
    verifyToken,

    expressAsyncHandler(async (req, res) => {
        try {
            const { slug } = req.params;
            const obj = { ...req.body };

            if (!slug) {
                return notFoundResponse(res, "Slug not provided");
            }

            const category = await db.category.findOne({ where: { slug } });

            if (!category) {
                return notFoundResponse(res, "Category not found");
            }

            // Slug uniqueness check (if updating slug)
            if (req.body?.slug) {
                const isSlugExist = await db.category.findOne({
                    where: {
                        [Op.and]: [
                            { id: { [Op.ne]: category.id } },
                            { slug: req.body.slug }
                        ]
                    }
                });

                if (isSlugExist) {
                    return successResponse(res, {
                        status: false,
                        message: "Sorry, slug already exists",
                    });
                }
            }

            // Validate parent category if parent_id is present
            if (obj.parent_id) {
                const parent = await db.category.findByPk(obj.parent_id);
                if (!parent) {
                    return successResponse(res, {
                        status: false,
                        message: "Parent category does not exist",
                    });
                }
            }

            // Handle file update (if you're supporting image upload)
            if (req.file) {
                obj.cover_image = req.file.path;
            }

            await category.update({ ...obj });

            return successResponse(res, {
                status: true,
                message: "Category updated successfully",
                data: category,
            });

        } catch (error) {
            console.log(error);
            return serverErrorResponse(res, error);
        }
    }),
];

//  Delete Category
CategoryController.delete = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const category = await db.category.findByPk(id);

            if (!category) {
                return notFoundResponse(res, "Category not found");
            }


            // Soft delete (Sequelize will set deletedAt field due to paranoid: true)
            await db.category.destroy({
                where: { id }
            });

            return successResponse(res, {
                status: true,
                message: "Category deleted successfully",
            });
        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];
// Soft Delete Category
CategoryController.softDelete = [
    verifyToken,
    expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const category = await db.category.findByPk(id);

            if (!category) {
                return notFoundResponse(res, "Category not found");
            }

            // Check for child categories
            const childCount = await db.category.count({ where: { parent_id: id } });

            if (childCount > 0) {
                return successResponse(res, {
                    status: false,
                    message: "Please delete or reassign child categories before deleting this one.",
                });
            }


            category.is_deleted = true
            // Perform soft delete
            await category.save(); // Sequelize handles `deletedAt` via paranoid

            return successResponse(res, {
                status: true,
                message: "Category deleted successfully.",
            });

        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];


// Get tree
CategoryController.getTree = [
    expressAsyncHandler(async (req, res) => {
        try {
            const categories = await db.category.findAll({
                attributes: ["id", "name", "slug", "parent_id"],
                // order: [["createdAt", "ASC"]],
                raw: true,
            });

            // Helper to build nested structure
            const buildTree = (items, parentId = null) => {
                return items
                    .filter(item => item.parent_id === parentId)
                    .map(item => ({
                        ...item,
                        subMenu: buildTree(items, item.id)
                    }));
            };

            const tree = buildTree(categories, null);

            return successResponse(res, {
                status: true,
                data: tree
            });

        } catch (error) {
            console.error(error);
            return serverErrorResponse(res, error);
        }
    }),
];

module.exports = CategoryController;
