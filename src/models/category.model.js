"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class category extends Model {
        static associate(models) {
            // Self Join: A category can have many children
            category.hasMany(models.category, {
                foreignKey: "parent_id",
                as: "children",
            });

            // Self Join: A category belongs to a parent
            category.belongsTo(models.category, {
                foreignKey: "parent_id",
                as: "parent",
            });
        }
    }

    category.init(
        {
            name: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(256),
                allowNull: true,
            },
            parent_id: {
                type: DataTypes.INTEGER, // changed from STRING to INTEGER for FK
                allowNull: true,         // root categories will have NULL parent
            },
            is_deleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },

        },
        {
            sequelize,
            modelName: "category",     // you had this commented out
            paranoid: true,
            timestamps: true,
        }
    );

    return category;
};
