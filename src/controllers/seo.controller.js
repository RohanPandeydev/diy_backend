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
const { where, col, fn, Op } = require("sequelize")

const SeoController = {};

// Create SEO
SeoController.create = [
    verifyToken,
    upload.single("og_image"),
    expressAsyncHandler(async (req, res) => {
        try {
            const { title, slug, category_slug } = req.body;
            const author_id = req.user.id;
            const obj = { ...req.body };


            if (!(title && slug && category_slug)) {
                return successResponse(res, {
                    status: false,
                    message: "Please fill all required fields",
                });
            }
            const findCategory = await db.category.findOne({ where: { slug: category_slug } })
            // console.log(findCategory, "ggg")

            if (!findCategory) {
                return successResponse(res, {
                    status: false,
                    message: "category not found",
                });
            }

            obj.category_id = findCategory?.id

            const findAuthor = await db.user.findByPk(author_id);
            if (!findAuthor) {
                return successResponse(res, {
                    status: false,
                    message: "Author not found",
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
                obj.og_image = req.file.path;
            }

            obj.author_id = author_id;
            console.log(findCategory.slug, "findCategory.slug ")

            const seo = await db.seo.create(obj);
            await db.category.update(
                { slug: seo.slug },
                { where: { id: findCategory.id } }
            );

            // Fetch fresh SEO entry to ensure latest data
            const populatedSeo = await db.seo.findOne({
                where: { id: seo.id },
                include: [
                    {
                        model: db.category,
                        as: 'category',
                        include: [
                            {
                                model: db.category,
                                as: 'parent'
                            }
                        ]
                    }
                ]
            });


            return successResponse(res, {
                status: true,
                message: "SEO entry created successfully",
                data: populatedSeo,
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
    
    expressAsyncHandler(async (req, res) => {
        try {
            const { slug } = req.params;
            const seo = await db.seo.findOne({
                where: { slug },
                include: [
                    { model: db.category, as: "category" },
                ],
            });

            if (!seo) return successResponse(res, {
                status: false,
                message: "seo not found",
            });;


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
                return successResponse(res, {
                    status: false,
                    message: "Seo not found",
                });;
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
    upload.single("og_image"),
    expressAsyncHandler(async (req, res) => {
        try {
            const { slug } = req.params;
            const obj = { ...req.body };

            const seo = await db.seo.findOne({
                where: { slug }
                ,
            });

            if (!seo) return successResponse(res, {
                status: false,
                message: "seo  not found",
            });



            if (req.body.slug && req.body.slug !== slug) {
                const existing = await db.seo.findOne({
                    where: {
                        [Op.and]: [
                            { id: { [Op.ne]: seo.id } },
                            { slug: req.body.slug },
                        ],
                    },
                });
                if (existing) {
                    return successResponse(res, {
                        status: false,
                        message: "Slug already exists",
                    });
                }
            }
            const findCategory = await db.category.findOne({ where: { slug: slug } })

            console.log(findCategory, "---------")


            if (req.file) {
                obj.og_image = req.file.path;
                if (seo.og_image) deleteFile(seo.og_image);
            }

            await seo.update(obj);





            await db.category.update(
                { slug: req.body.slug },
                { where: { id: findCategory.id } }
            );

            // Fetch fresh SEO entry to ensure latest data
            const populatedSeo = await db.seo.findOne({
                where: { id: seo.id },
                include: [
                    {
                        model: db.category,
                        as: 'category',
                        include: [
                            {
                                model: db.category,
                                as: 'parent'
                            }
                        ]
                    }
                ]
            });

            return successResponse(res, {
                status: true,
                message: "SEO entry updated successfully",
                data: populatedSeo,
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

            if (!seo) return successResponse(res, {
                status: false,
                message: "seo not found",
            });;

            if (seo.og_image) deleteFile(seo.og_image);
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
