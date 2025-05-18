"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class userpermission extends Model {
        static associate(models) {
            // Blog belongs to a user (author)
            userpermission.belongsTo(models.permission, {
                foreignKey: "permission_id",
                as: "permission",
            });

            // Blog belongs to a category
            userpermission.belongsTo(models.user, {
                foreignKey: "user_id",
                as: "user",
            });
        }
    }

    userpermission.init(
        {


            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            permission_id: {
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
            modelName: "userpermission",
            paranoid: true,
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['user_id', 'permission_id'],
                },
            ],
        }
    );

    return userpermission;
};
