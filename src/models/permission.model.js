"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class permission extends Model {
        static associate(models) {


            // Blog belongs to a category
            permission.belongsTo(models.permissionmodule, {
                foreignKey: "module_id",
                as: "module",
            });
        }
    }

    permission.init(
        {


            action: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },

            module_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            is_deleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },

        },
        {
            sequelize,
            modelName: "permission",
            paranoid: true,
            timestamps: true,


        }
    );

    return permission;
};
