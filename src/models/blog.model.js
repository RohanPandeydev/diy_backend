"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class blog extends Model {
        static associate(models) {
            // Blog belongs to a user (author)
            blog.belongsTo(models.user, {
                foreignKey: "author_id",
                as: "author",
            });

            // Blog belongs to a category
            blog.belongsTo(models.category, {
                foreignKey: "category_id",
                as: "category",
            });
        }
    }

    blog.init(
        {
            title: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            author_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            is_published: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            is_featured: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            published_at: {
                type: DataTypes.DATE,
            },
            is_deleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            cover_image: {
                type: DataTypes.TEXT,
            },
        },
        {
            sequelize,
            modelName: "blog",
            paranoid: true,
            timestamps: true,
        }
    );

    return blog;
};
