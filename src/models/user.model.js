"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class user extends Model {


        static associate(models) {
            // User belongs to a user (author)
            user.belongsTo(models.user, {
                foreignKey: "reporting_to",
                as: "reporting",
            });
        }
    }


    user.init(
        {
            first_name: {
                type: DataTypes.STRING(64),
                lowercase: true,
            },
            last_name: {
                type: DataTypes.STRING(64),
                lowercase: true,
            },
            email: {
                type: DataTypes.STRING(128),
                allowNull: false,
            },


            phone_number: {
                type: DataTypes.STRING(128),
            },

            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false,
            },
            is_deleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            role: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
                defaultValue: 0,
            },
            reporting_to: {
                type: DataTypes.INTEGER, // changed from STRING to INTEGER for FK
                allowNull: true,         // root categories will have NULL parent
            },

            profile_img: {
                type: DataTypes.TEXT,
            },
        },
        {
            sequelize,
            paranoid: true,
            // modelName: "user",
        }
    );
    return user;
};
