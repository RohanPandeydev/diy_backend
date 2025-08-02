"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class FormSubmission extends Model {
        static associate(models) {
            // Define associations if needed in the future
        }
    }

    FormSubmission.init(
        {
            // Common fields
            name: {
                type: DataTypes.STRING(128),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(128),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            
            // Form type to distinguish between the three forms
            form_type: {
                type: DataTypes.ENUM('design_consultant', 'inquiry', 'contact'),
                allowNull: false,
            },
            
            // Optional fields based on form type
            company: {
                type: DataTypes.STRING(128),
                allowNull: true,
            },
            subject: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            interest_of_services: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            
            // Status tracking
            status: {
                type: DataTypes.ENUM('new', 'in_progress', 'completed', 'rejected'),
                defaultValue: 'new',
                allowNull: false,
            },
            
            // Admin notes
            admin_notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            
            is_deleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
        {
            sequelize,
            paranoid: true,
            modelName: "FormSubmission",
        }
    );
    return FormSubmission;
}; 