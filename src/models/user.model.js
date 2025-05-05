"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class user extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
     
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
