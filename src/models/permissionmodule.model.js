"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

    class permissionmodule extends Model {
        static associate(models) {
            permissionmodule.hasMany(models.permission, {
                foreignKey: "module_id",
                as: "permissions",
            });
        }
    }


    permissionmodule.init(
        {
            name: {
                type: DataTypes.STRING(256),
                allowNull: false,
            },


            is_deleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },

        },
        {
            sequelize,
            modelName: "permissionmodule",
            paranoid: true,
            timestamps: true,

        }
    );

    return permissionmodule;
};
