"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SeoContent extends Model {
    /**
     * Helper method for defining associations (future use).
     */
    static associate(models) {
      // define association here if needed
    }
  }

  SeoContent.init(
    {
      page_slug: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // unique: true,
      },
      meta_title: {
        type: DataTypes.STRING(70),
      },
      meta_description: {
        type: DataTypes.TEXT,
      },
      meta_keywords: {
        type: DataTypes.TEXT,
      },
      og_title: {
        type: DataTypes.STRING(200),
      },
      og_description: {
        type: DataTypes.TEXT,
      },
      og_image_url: {
        type: DataTypes.STRING(200),
      },
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SeoContent",
      tableName: "seo_contents", // to match your database table exactly
      timestamps: true,
      paranoid: true, // if you don't need soft deletes
    }
  );

  return SeoContent;
};
