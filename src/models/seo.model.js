    "use strict";
    const { Model } = require("sequelize");

    module.exports = (sequelize, DataTypes) => {
        class seo extends Model {
            static associate(models) {
                seo.belongsTo(models.user, {
                    foreignKey: "author_id",
                    as: "author",
                });

                seo.belongsTo(models.category, {
                    foreignKey: "category_id",
                    as: "category",
                });
            }
        }

        seo.init(
            {
                title: {
                    type: DataTypes.STRING(256),
                    allowNull: false,
                },
                slug: {
                    type: DataTypes.STRING(256),
                    allowNull: false,
                },
                meta_title: {
                    type: DataTypes.STRING(256),
                    allowNull: true,
                },
                meta_description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                meta_keywords: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                canonical_url: {
                    type: DataTypes.STRING(512),
                    allowNull: true,
                },
                og_title: {
                    type: DataTypes.STRING(256),
                    allowNull: true,
                },
                og_description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                og_image: {
                    type: DataTypes.STRING(512),
                    allowNull: true,
                },
                og_type: {
                    type: DataTypes.STRING(50),
                    defaultValue: "website",
                },
                robots: {
                    type: DataTypes.STRING(50),
                    defaultValue: "index, follow",
                },
                custom_head_scripts: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                custom_footer_cripts: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },

                google_cseid: {
                    type: DataTypes.STRING(128),
                    allowNull: true,
                },

                // Existing  fields
                author_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                category_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },

              
                cover_image: {
                    type: DataTypes.TEXT,
                },
            },
            {
                sequelize,
                modelName: "seo",
                paranoid: true,
                timestamps: true,
            }
        );

        return seo;
    };
